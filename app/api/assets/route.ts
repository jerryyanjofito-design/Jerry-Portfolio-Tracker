import { NextRequest, NextResponse } from 'next/server'
import {
  getAssets,
  getAssetsByType,
  createAsset,
  getAssetHoldings,
} from '@/lib/supabase/client'
import { getBatchMarketPrices, getMarketPrice } from '@/lib/api/market-data'
import { getFXRate } from '@/lib/utils/currency'
import { assetSchema } from '@/lib/utils/validation'
import { calculateAssetValue } from '@/lib/utils/calculations'

// Type for asset holdings with currency info
interface AssetHolding {
  id: string
  ticker: string
  name: string | null
  security_type: string
  shares: number
  purchase_price: number
  current_price: number | null
  current_value: number | null
  cost_basis: number
  return_percentage: number
  gain_loss: number
  currency: string
  price_currency: string | null
  updated_at: string
}

/**
 * GET /api/assets
 * List all assets with optional filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    let assets
    if (type) {
      assets = await getAssetsByType(type)
    } else {
      assets = await getAssets()
    }

    // Get holdings with current prices
    const holdings = (await getAssetHoldings()) as AssetHolding[]

    // Filter by type if specified
    let filteredHoldings = holdings
    if (type) {
      filteredHoldings = holdings.filter(h => h.security_type === type)
    }

    // Sort holdings
    const sortedHoldings = [...filteredHoldings].sort((a, b) => {
      let comparison = 0

      switch (sort) {
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker)
          break
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'security_type':
          comparison = a.security_type.localeCompare(b.security_type)
          break
        case 'current_value':
          comparison = (a.current_value || 0) - (b.current_value || 0)
          break
        case 'return_percentage':
          comparison = a.return_percentage - b.return_percentage
          break
        default:
          comparison = 0
      }

      return order === 'desc' ? -comparison : comparison
    })

    // Calculate totals
    const totalValue = sortedHoldings.reduce((sum, h) => sum + (h.current_value || 0), 0)
    const totalCostBasis = sortedHoldings.reduce((sum, h) => sum + (h.cost_basis || 0), 0)
    const totalGainLoss = sortedHoldings.reduce((sum, h) => sum + (h.gain_loss || 0), 0)

    return NextResponse.json({
      assets: sortedHoldings,
      total: sortedHoldings.length,
      summary: {
        totalValue,
        totalCostBasis,
        totalGainLoss,
        totalReturnPercentage: totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = assetSchema.parse(body)

    // Try to fetch current price
    const priceData = await getMarketPrice(validated.ticker, validated.security_type)

    // Create asset
    const newAsset = await createAsset({
      ...validated,
    })

    return NextResponse.json(
      { asset: newAsset, currentPrice: priceData?.price || null },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating asset:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}
