import { NextRequest, NextResponse } from 'next/server'
import {
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetHoldings,
} from '@/lib/supabase/client'
import { getMarketPrice } from '@/lib/api/market-data'
import { updateAssetSchema } from '@/lib/utils/validation'

/**
 * GET /api/assets/:id
 * Get a single asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await getAssetById(params.id)

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Get current price
    const priceData = await getMarketPrice(asset.ticker, asset.security_type)

    return NextResponse.json({
      asset,
      currentPrice: priceData?.price || null,
    })
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/assets/:id
 * Update an asset
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validated = updateAssetSchema.parse({
      ...body,
      id: params.id,
    })

    // Remove id from updates (it's in the path)
    const { id, ...updates } = validated

    const updatedAsset = await updateAsset(params.id, updates)

    if (!updatedAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ asset: updatedAsset })
  } catch (error) {
    console.error('Error updating asset:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/assets/:id
 * Delete an asset
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteAsset(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
