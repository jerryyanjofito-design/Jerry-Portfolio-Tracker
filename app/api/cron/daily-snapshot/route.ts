import { NextRequest, NextResponse } from 'next/server'
import { getAssets, getCashAccounts, createSnapshot, getSnapshotByDate } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/supabase/client'
import { calculatePortfolioMetrics } from '@/lib/utils/calculations'

/**
 * POST /api/cron/daily-snapshot?secret=CRON_SECRET
 * Scheduled job to create daily snapshot
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { date } = body

    // Use provided date or yesterday's date (for daily cron)
    const snapshotDate = date || (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split('T')[0]
    })()

    // Check if snapshot already exists
    const existing = await getSnapshotByDate(snapshotDate)
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Snapshot already exists for this date',
        snapshot_id: existing.id,
      })
    }

    // Get current portfolio data
    const assets = await getAssets()
    const cashAccounts = await getCashAccounts()

    // Get FX rates
    const fxRates: Record<string, number> = {}

    const currencies = [
      ...new Set(assets.map(a => a.currency)),
      ...new Set(cashAccounts.map(a => a.currency)),
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
    // Note: We need to get current prices for assets, which requires market data fetching
    // For now, we'll use cost basis as a fallback
    let totalAssetsValue = 0
    let assetsBreakdown: Record<string, number> = {
      Stocks: 0,
      ETFs: 0,
      Crypto: 0,
      Gold: 0,
      Bonds: 0,
      PrivateInvestment: 0,
    }

    for (const asset of assets) {
      const value = asset.shares * asset.purchase_price
      const currency = asset.currency
      const rate = fxRates[`${currency}IDR`] || 1
      const valueInIDR = value * rate

      totalAssetsValue += valueInIDR

      const type = asset.security_type
      if (assetsBreakdown.hasOwnProperty(type)) {
        assetsBreakdown[type] += valueInIDR
      }
    }

    // Calculate total cash
    let totalCashValue = 0
    for (const account of cashAccounts) {
      const currency = account.currency
      const rate = fxRates[`${currency}IDR`] || 1
      const balanceInIDR = Number(account.balance) * rate
      totalCashValue += balanceInIDR
    }

    const totalNetWorth = totalAssetsValue + totalCashValue

    // Create snapshot
    const snapshot = await createSnapshot({
      date: snapshotDate,
      total_net_worth: totalNetWorth,
      total_assets_value: totalAssetsValue,
      total_cash_value: totalCashValue,
      assets_breakdown: assetsBreakdown,
      cash_breakdown: {
        ...assetsBreakdown,
        Cash: totalCashValue,
      },
    })

    return NextResponse.json({
      success: true,
      snapshot_id: snapshot.id,
      totals: {
        total_net_worth: totalNetWorth,
        total_assets_value: totalAssetsValue,
        total_cash_value: totalCashValue,
      },
    })
  } catch (error) {
    console.error('Error creating daily snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to create daily snapshot' },
      { status: 500 }
    )
  }
}
