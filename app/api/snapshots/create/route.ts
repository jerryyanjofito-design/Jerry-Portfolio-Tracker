import { NextRequest, NextResponse } from 'next/server'
import {
  getAssetHoldings,
  getCashAccounts,
  createSnapshot,
  getSnapshotByDate,
} from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { calculatePortfolioMetrics } from '@/lib/utils/calculations'

/**
 * POST /api/snapshots/create
 * Create a daily snapshot
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date } = body

    // Use provided date or today
    const snapshotDate = date || new Date().toISOString().split('T')[0]

    // Check if snapshot already exists for this date
    const existing = await getSnapshotByDate(snapshotDate)
    if (existing) {
      return NextResponse.json(
        { error: 'Snapshot already exists for this date' },
        { status: 409 }
      )
    }

    // Get current portfolio data
    const holdings = await getAssetHoldings()
    const cashAccounts = await getCashAccounts()

    // Get FX rates
    const fxRates: Record<string, number> = {}

    const currencies = [
      ...Array.from(new Set(
        holdings
          .map(h => h.price_currency)
          .filter((c): c is string => c !== null && c !== 'IDR')
      )),
      ...Array.from(new Set(cashAccounts.map(a => a.currency).filter(c => c !== 'IDR')))
    ]
    currencies.push('IDR')

    for (const currency of currencies) {
      if (currency === 'IDR') {
        fxRates['IDRIDR'] = 1
      } else {
        try {
          const rate = await getFXRate(currency, 'IDR')
          fxRates[`${currency}IDR`] = rate
        } catch (error) {
          fxRates[`${currency}IDR`] = 1
        }
      }
    }

    // Calculate portfolio metrics
    const portfolioMetrics = await calculatePortfolioMetrics(
      holdings,
      cashAccounts,
      fxRates
    )

    // Create snapshot
    const snapshot = await createSnapshot({
      date: snapshotDate,
      total_net_worth: portfolioMetrics.totalNetWorth,
      total_assets_value: portfolioMetrics.totalAssetsValue,
      total_cash_value: portfolioMetrics.totalCashValue,
      assets_breakdown: portfolioMetrics.allocation,
      cash_breakdown: {
        ...portfolioMetrics.allocation,
        Cash: portfolioMetrics.allocation.Cash,
      },
    })

    return NextResponse.json(
      {
        snapshot,
        totals: {
          total_net_worth: portfolioMetrics.totalNetWorth,
          total_assets_value: portfolioMetrics.totalAssetsValue,
          total_cash_value: portfolioMetrics.totalCashValue,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    )
  }
}
