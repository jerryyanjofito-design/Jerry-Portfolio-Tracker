import { NextRequest, NextResponse } from 'next/server'
import { getAssets } from '@/lib/supabase/client'
import { refreshMarketData } from '@/lib/api/market-data'
import type { Asset } from '@/types'

/**
 * POST /api/market/refresh
 * Force refresh all cached market data
 */
export async function POST(request: NextRequest) {
  try {
    // Get all assets
    const assets = (await getAssets()) as Asset[]

    // Extract unique tickers
    const tickers = Array.from(new Set(assets.map(a => a.ticker)))

    // Refresh market data
    const refreshed = await refreshMarketData(tickers)

    return NextResponse.json({
      refreshed,
      timestamp: new Date().toISOString(),
      total: tickers.length,
    })
  } catch (error) {
    console.error('Error refreshing market data:', error)
    return NextResponse.json(
      { error: 'Failed to refresh market data' },
      { status: 500 }
    )
  }
}
