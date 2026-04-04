import { NextRequest, NextResponse } from 'next/server'
import { getAssets } from '@/lib/supabase/client'
import { refreshMarketData } from '@/lib/api/market-data'

// Type for asset
interface Asset {
  id: string
  ticker: string
  name: string | null
  security_type: string
  shares: number
  purchase_price: number
  currency: string
  country: string | null
  exchange: string | null
  created_at: string
  updated_at: string
}

/**
 * POST /api/cron/refresh-markets?secret=CRON_SECRET
 * Scheduled job to refresh market data
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

    // Get all assets
    const assets = (await getAssets()) as Asset[]

    // Extract unique tickers
    const tickers = Array.from(new Set(assets.map(a => a.ticker)))

    // Refresh market data
    const refreshed = await refreshMarketData(tickers)

    return NextResponse.json({
      success: true,
      refreshed,
      total: tickers.length,
      failed: tickers.length - refreshed,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error refreshing markets:', error)
    return NextResponse.json(
      { error: 'Failed to refresh markets' },
      { status: 500 }
    )
  }
}
