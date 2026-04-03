import { NextRequest, NextResponse } from 'next/server'
import {
  getCashAccounts,
  createCashAccount,
} from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { cashAccountSchema } from '@/lib/utils/validation'

/**
 * GET /api/cash
 * List all cash accounts with currency conversions
 */
export async function GET(request: NextRequest) {
  try {
    const accounts = await getCashAccounts()

    // Get FX rates for conversion
    const fxRates: Record<string, number> = {}

    // Collect unique currencies (excluding IDR)
    const currencies = Array.from(new Set(accounts.map(a => a.currency).filter(c => c !== 'IDR')))

    // Fetch FX rates
    for (const currency of currencies) {
      try {
        const rate = await getFXRate(currency, 'IDR')
        fxRates[`${currency}IDR`] = rate
      } catch (error) {
        console.error(`Error fetching FX rate for ${currency}:`, error)
        fxRates[`${currency}IDR`] = 1
      }
    }

    // Add IDR rate (1:1)
    fxRates['IDRIDR'] = 1

    // Calculate IDR equivalents and totals
    const accountsWithConversion = accounts.map(account => {
      const rateKey = `${account.currency}IDR`
      const rate = fxRates[rateKey] || 1
      const idrEquivalent = Number(account.balance) * rate

      return {
        ...account,
        idr_equivalent: idrEquivalent,
        fx_rate: rate,
      }
    })

    // Calculate totals
    const totalIDR = accountsWithConversion.reduce((sum, a) => sum + a.idr_equivalent, 0)

    // Breakdown by currency
    const breakdownByCurrency: Record<string, { balance: number; idr_equivalent: number }> = {}
    accountsWithConversion.forEach(account => {
      if (!breakdownByCurrency[account.currency]) {
        breakdownByCurrency[account.currency] = { balance: 0, idr_equivalent: 0 }
      }
      breakdownByCurrency[account.currency].balance += Number(account.balance)
      breakdownByCurrency[account.currency].idr_equivalent += account.idr_equivalent
    })

    return NextResponse.json({
      accounts: accountsWithConversion,
      total_idr: totalIDR,
      breakdown_by_currency: breakdownByCurrency,
    })
  } catch (error) {
    console.error('Error fetching cash accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cash accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cash
 * Create a new cash account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = cashAccountSchema.parse(body)

    // Create account
    const newAccount = await createCashAccount(validated)

    return NextResponse.json(
      { account: newAccount },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating cash account:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create cash account' },
      { status: 500 }
    )
  }
}
