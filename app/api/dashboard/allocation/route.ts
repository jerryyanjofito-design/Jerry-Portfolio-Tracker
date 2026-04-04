import { NextRequest, NextResponse } from 'next/server'
import { getAssetHoldings, getCashAccounts } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { calculatePortfolioMetrics, getAllocationChartData } from '@/lib/utils/calculations'

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
 * GET /api/dashboard/allocation
 * Get asset allocation breakdown
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const by = searchParams.get('by') || 'category' // 'category' or 'currency'

    const holdings = (await getAssetHoldings()) as AssetHolding[]
    const cashAccounts = (await getCashAccounts()) as CashAccount[]

    // Get FX rates for currency conversion
    const fxRates: Record<string, number> = {}

    const currencies = [
      ...Array.from(new Set(
        holdings
          .map(h => h.price_currency)
          .filter((c): c is string => c !== null && c !== 'IDR')
      )),
      ...Array.from(new Set(cashAccounts.map(a => a.currency).filter(c => c !== 'IDR')))
    ]

    for (const currency of currencies) {
      try {
        const rate = await getFXRate(currency, 'IDR')
        fxRates[`${currency}IDR`] = rate
      } catch (error) {
        fxRates[`${currency}IDR`] = 1
      }
    }

    fxRates['IDRIDR'] = 1

    if (by === 'currency') {
      // Calculate allocation by currency
      const allocationByCurrency: Record<string, number> = {}

      // Assets by currency
      holdings.forEach(holding => {
        const currency = holding.price_currency || 'IDR'
        const value = holding.current_value || 0
        const rate = fxRates[`${currency}IDR`] || 1
        const valueInIDR = value * rate

        if (!allocationByCurrency[currency]) {
          allocationByCurrency[currency] = 0
        }
        allocationByCurrency[currency] += valueInIDR
      })

      // Cash by currency
      cashAccounts.forEach(account => {
        const currency = account.currency
        const balance = Number(account.balance)
        const rate = fxRates[`${currency}IDR`] || 1
        const balanceInIDR = balance * rate

        if (!allocationByCurrency[currency]) {
          allocationByCurrency[currency] = 0
        }
        allocationByCurrency[currency] += balanceInIDR
      })

      const total = Object.values(allocationByCurrency).reduce((a, b) => a + b, 0)

      const chartData = Object.entries(allocationByCurrency)
        .filter(([_, value]) => value > 0)
        .map(([currency, value]) => ({
          category: currency,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0,
          color: getCurrencyColor(currency),
        }))

      return NextResponse.json({
        breakdown: allocationByCurrency,
        chart_data: chartData,
        total,
      })
    }

    // Default: allocation by category
    const portfolioMetrics = await calculatePortfolioMetrics(
      holdings,
      cashAccounts,
      fxRates
    )

    const chartData = getAllocationChartData(portfolioMetrics.allocation)

    return NextResponse.json({
      breakdown: portfolioMetrics.allocation,
      chart_data: chartData,
      total: portfolioMetrics.totalNetWorth,
    })
  } catch (error) {
    console.error('Error fetching allocation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allocation' },
      { status: 500 }
    )
  }
}

function getCurrencyColor(currency: string): string {
  const colors: Record<string, string> = {
    IDR: '#3B82F6',
    USD: '#10B981',
    SGD: '#F59E0B',
    EUR: '#8B5CF6',
    GBP: '#EF4444',
    JPY: '#6366F1',
  }
  return colors[currency] || '#9CA3AF'
}
