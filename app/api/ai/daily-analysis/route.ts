import { NextRequest, NextResponse } from 'next/server'
import { getDailyAnalysis } from '@/lib/api/ai'
import { getAssetHoldings, getCashAccounts, getLatestSnapshot } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { calculatePortfolioMetrics, getTopPerformers, getWorstPerformers } from '@/lib/utils/calculations'
import type { AssetHolding, CashAccount } from '@/types'

// Type for snapshot
interface Snapshot {
  id: string
  date: string
  total_net_worth: number
  total_assets_value: number
  total_cash_value: number
  assets_breakdown: Record<string, number>
  cash_breakdown: Record<string, number>
  created_at: string
}

/**
 * GET /api/ai/daily-analysis
 * Get AI-generated daily portfolio analysis
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('force_refresh') === 'true'

    // Get portfolio data
    const holdings = (await getAssetHoldings()) as AssetHolding[]
    const cashAccounts = (await getCashAccounts()) as CashAccount[]

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

    // Get latest snapshot for daily change
    const latestSnapshot = (await getLatestSnapshot()) as Snapshot | null
    let dailyChange = 0
    let dailyChangePercentage = 0

    if (latestSnapshot) {
      const changeData = {
        change: portfolioMetrics.totalNetWorth - latestSnapshot.total_net_worth,
        percentage: latestSnapshot.total_net_worth > 0
          ? ((portfolioMetrics.totalNetWorth - latestSnapshot.total_net_worth) / latestSnapshot.total_net_worth) * 100
          : 0,
      }
      dailyChange = changeData.change
      dailyChangePercentage = changeData.percentage
    }

    // Get top and worst performers
    const topPerformers = getTopPerformers(holdings, 5)
    const worstPerformers = getWorstPerformers(holdings, 5)

    // Build context for AI
    const context = {
      portfolio: {
        totalNetWorth: portfolioMetrics.totalNetWorth,
        totalAssets: portfolioMetrics.totalAssetsValue,
        totalCash: portfolioMetrics.totalCashValue,
        dailyChange,
        dailyChangePercentage,
      },
      topPerformers: topPerformers.map(p => ({
        ticker: p.ticker,
        name: p.name || 'Unknown',
        returnPercentage: p.return_percentage,
      })),
      worstPerformers: worstPerformers.map(p => ({
        ticker: p.ticker,
        name: p.name || 'Unknown',
        returnPercentage: p.return_percentage,
      })),
      allocation: portfolioMetrics.allocation as unknown as Record<string, number>,
      date: new Date().toISOString(),
    }

    // Get or generate daily analysis
    const analysis = await getDailyAnalysis(context)

    return NextResponse.json({
      analysis,
      insights: {
        topPerformers: topPerformers.slice(0, 3),
        worstPerformers: worstPerformers.slice(0, 3),
        totalGainLoss: portfolioMetrics.totalGainLoss,
        totalReturnPercentage: portfolioMetrics.totalReturnPercentage,
      },
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating daily analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate daily analysis' },
      { status: 500 }
    )
  }
}
