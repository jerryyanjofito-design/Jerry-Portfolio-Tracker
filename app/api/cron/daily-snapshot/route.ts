/**
 * POST /api/cron/daily-snapshot
 * NOTE: Cron jobs disabled - use manual triggers instead to avoid Vercel free tier limits
 */
import { NextRequest, NextResponse } from 'next/server'
import { getAssets, getCashAccounts, createSnapshot } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date } = body

    // Use provided date or yesterday's date
    const snapshotDate = date || (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split('T')[0]
    })()

    // Check if snapshot already exists
    // Note: Skipping this check since cron jobs are disabled

    // Get current portfolio data
    const assets = await getAssets()
    const cashAccounts = await getCashAccounts()

    // Simple calculation (without market data to keep this fast)
    const totalAssetsValue = assets.reduce((sum, a) => sum + (a.shares * a.purchase_price), 0)
    const totalCashValue = cashAccounts.reduce((sum, a) => sum + Number(a.balance), 0)
    const totalNetWorth = totalAssetsValue + totalCashValue

    // Calculate asset breakdown
    const assetsBreakdown: Record<string, number> = {
      Stocks: 0,
      ETFs: 0,
      Crypto: 0,
      Gold: 0,
      Bonds: 0,
      PrivateInvestment: 0,
    }

    for (const asset of assets) {
      const type = asset.security_type === 'Private Investment' ? 'PrivateInvestment' : asset.security_type
      if (assetsBreakdown.hasOwnProperty(type)) {
        assetsBreakdown[type] += asset.shares * asset.purchase_price
      }
    }

    const cashBreakdown = cashAccounts.reduce((acc, obj) => {
      obj[acc.currency] = (obj[acc.currency] || 'IDR')
      return obj[acc.currency] += Number(acc.balance)
    }, {})

    // Create snapshot
    const snapshot = await createSnapshot({
      date: snapshotDate,
      total_net_worth,
      total_assets_value: totalAssetsValue,
      total_cash_value: totalCashValue,
      assets_breakdown: assetsBreakdown,
      cash_breakdown: cashBreakdown,
    })

    if (!snapshot) {
      throw new Error('Failed to create snapshot')
    }

    return NextResponse.json({
      success: true,
      snapshot_id: snapshot.id,
      totals: {
        total_net_worth,
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
