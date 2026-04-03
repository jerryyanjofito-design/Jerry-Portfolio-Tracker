import { NextRequest, NextResponse } from 'next/server'
import {
  getCashAccountById,
  updateCashAccount,
  deleteCashAccount,
} from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { updateCashAccountSchema } from '@/lib/utils/validation'

/**
 * GET /api/cash/:id
 * Get a single cash account
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const account = await getCashAccountById(params.id)

    if (!account) {
      return NextResponse.json(
        { error: 'Cash account not found' },
        { status: 404 }
      )
    }

    // Get FX rate for IDR conversion
    let fxRate = 1
    let idrEquivalent = Number(account.balance)

    if (account.currency !== 'IDR') {
      try {
        fxRate = await getFXRate(account.currency, 'IDR')
        idrEquivalent = Number(account.balance) * fxRate
      } catch (error) {
        console.error('Error fetching FX rate:', error)
      }
    }

    return NextResponse.json({
      account: {
        ...account,
        idr_equivalent: idrEquivalent,
        fx_rate: fxRate,
      },
    })
  } catch (error) {
    console.error('Error fetching cash account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cash account' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cash/:id
 * Update a cash account
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validated = updateCashAccountSchema.parse({
      ...body,
      id: params.id,
    })

    // Remove id from updates (it's in the path)
    const { id, ...updates } = validated

    const updatedAccount = await updateCashAccount(params.id, updates)

    if (!updatedAccount) {
      return NextResponse.json(
        { error: 'Cash account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ account: updatedAccount })
  } catch (error) {
    console.error('Error updating cash account:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update cash account' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cash/:id
 * Delete a cash account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCashAccount(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cash account:', error)
    return NextResponse.json(
      { error: 'Failed to delete cash account' },
      { status: 500 }
    )
  }
}
