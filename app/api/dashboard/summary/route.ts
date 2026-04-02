import { NextRequest, NextResponse } from 'next/server'
import {
  getAssetHoldings,
  getPortfolioSummary,
  getCashAccounts,
  getLatestSnapshot,
} from '@/lib/supabase/client'
import { getFXRate } from '@/lib/supabase/client'
import { calculatePortfolioMetrics, calculateGoalProgress, calculateDailyChange } from '@/lib/utils/calculations'
import { getTopPerformers, getWorstPerformers } from '@/lib/utils/calculations'

/**
 * GET /api/dashboard/summary
 * Get dashboard overview data
 */
export async function GET(request: NextRequest) {
  try {
    const goalAmount = Number(process.env.GOAL_AMOUNT) || 15000000000

    // Get holdings and cash accounts
    const holdings = await getAssetHoldings()
    const cashAccounts = await getCashAccounts()

    // Get FX rates for currency conversion
    const fxRates: Record<string, number> = {}

    // Collect unique currencies from holdings
    const currencies = [
      ...new Set(
        holdings
          .map(h => h.price_currency)
          .filter((c): c is string => c !== null && c !== 'IDR')
      ),
      ...new Set(cashAccounts.map(a => a.currency).filter(c => c !== 'IDR'))
    )
    ]

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

    fxRates['IDRIDR'] = 1

    // Calculate portfolio metrics
    const portfolioMetrics = await calculatePortfolioMetrics(
      holdings,
      cashAccounts,
      fxRates
    )

    // Calculate goal progress
    const goalProgress = calculateGoalProgress(
      portfolioMetrics.totalNetWorth,
      goalAmount
    )

    // Get latest snapshot for daily change
    const latestSnapshot = await getLatestSnapshot()
    let dailyChange = 0
    let dailyChangePercentage = 0

    if (latestSnapshot) {
      const changeData = calculateDailyChange(
        portfolioMetrics.totalNetWorth,
        latestSnapshot.total_net_worth
      )
      dailyChange = changeData.change
      dailyChangePercentage = changeData.percentage
    }

    // Get top and worst performers
    const topPerformers = getTopPerformers(holdings, 5)
    const worstPerformers = getWorstPerformers(holdings, 5)

    return NextResponse.json({
      net_worth: portfolioMetrics.totalNetWorth,
      goal_progress: goalProgress,
      goal_amount: goalAmount,
      total_assets: portfolioMetrics.totalAssetsValue,
      total_cash: portfolioMetrics.totalCashValue,
      total_cost_basis: portfolioMetrics.totalCostBasis,
      total_gain_loss: portfolioMetrics.totalGainLoss,
      total_return_percentage: portfolioMetrics.totalReturnPercentage,
      daily_change: dailyChange,
      daily_change_percentage: dailyChangePercentage,
      allocation: portfolioMetrics.allocation,
      top_performers: topPerformers,
      worst_performers: worstPerformers,
      updated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    )
  }
}
