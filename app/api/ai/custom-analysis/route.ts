import { NextRequest, NextResponse } from 'next/server'
import { generateCustomAnalysis } from '@/lib/api/ai'
import { getAssetHoldings, getCashAccounts } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/supabase/client'
import { calculatePortfolioMetrics } from '@/lib/utils/calculations'

/**
 * POST /api/ai/custom-analysis
 * Request custom analysis on specific assets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assets: selectedAssets, question } = body

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Get portfolio data
    const holdings = await getAssetHoldings()
    const cashAccounts = await getCashAccounts()

    // Get FX rates
    const fxRates: Record<string, number> = {}

    const currencies = [
      ...new Set(
        holdings
          .map(h => h.price_currency)
          .filter((c): c is string => c !== null && c !== 'IDR')
      ),
      ...new Set(cashAccounts.map(a => a.currency).filter(c => c !== 'IDR'))
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

    // Filter selected assets if provided
    let assets = holdings
    if (selectedAssets && Array.isArray(selectedAssets) && selectedAssets.length > 0) {
      assets = holdings.filter(h => selectedAssets.includes(h.ticker))
    }

    // Build context for AI
    const context = {
      question,
      assets: assets.map(a => ({
        ticker: a.ticker,
        name: a.name,
        securityType: a.security_type,
        currentValue: a.current_value || 0,
        returnPercentage: a.return_percentage,
      })),
      portfolio: {
        totalNetWorth: portfolioMetrics.totalNetWorth,
        allocation: portfolioMetrics.allocation,
      },
    }

    // Generate analysis
    const analysis = await generateCustomAnalysis(context)

    return NextResponse.json({
      analysis,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating custom analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom analysis' },
      { status: 500 }
    )
  }
}
