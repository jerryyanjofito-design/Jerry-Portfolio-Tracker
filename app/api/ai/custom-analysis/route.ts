import { NextRequest, NextResponse } from 'next/server'
import { generateCustomAnalysis } from '@/lib/api/ai'
import { getAssetHoldings, getCashAccounts } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { calculatePortfolioMetrics } from '@/lib/utils/calculations'

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

// Type for cash accounts
interface CashAccount {
  id: string
  account_name: string
  currency: string
  balance: number
  created_at: string
  updated_at: string
}

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
        name: a.name || 'Unknown',
        securityType: a.security_type,
        currentValue: a.current_value || 0,
        returnPercentage: a.return_percentage,
      })),
      portfolio: {
        totalNetWorth: portfolioMetrics.totalNetWorth,
        allocation: portfolioMetrics.allocation as unknown as Record<string, number>,
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
