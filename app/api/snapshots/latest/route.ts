import { NextRequest, NextResponse } from 'next/server'
import { getLatestSnapshot, getAssetHoldings, getCashAccounts } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { calculatePortfolioMetrics, calculateDailyChange } from '@/lib/utils/calculations'

/**
 * GET /api/snapshots/latest
 * Get the most recent snapshot
 */
export async function GET(request: NextRequest) {
  try {
    const latest = await getLatestSnapshot()

    if (!latest) {
      return NextResponse.json(
        { error: 'No snapshots found' },
        { status: 404 }
      )
    }

    // Get current portfolio data for comparison
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

    const portfolioMetrics = await calculatePortfolioMetrics(
      holdings,
      cashAccounts,
      fxRates
    )

    // Calculate daily change
    const dailyChange = calculateDailyChange(
      portfolioMetrics.totalNetWorth,
      latest.total_net_worth
    )

    return NextResponse.json({
      snapshot: latest,
      daily_change: dailyChange.change,
      daily_change_percentage: dailyChange.percentage,
      current_net_worth: portfolioMetrics.totalNetWorth,
    })
  } catch (error) {
    console.error('Error fetching latest snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch latest snapshot' },
      { status: 500 }
    )
  }
}
