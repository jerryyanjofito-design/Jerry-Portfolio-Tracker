import { NextRequest, NextResponse } from 'next/server'
import { getBatchMarketPrices } from '@/lib/api/market-data'

/**
 * POST /api/market/batch
 * Fetch prices for multiple tickers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tickers, provider, forceRefresh } = body

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json(
        { error: 'tickers must be a non-empty array' },
        { status: 400 }
      )
    }

    if (tickers.length > 50) {
      return NextResponse.json(
        { error: 'Cannot fetch more than 50 tickers at once' },
        { status: 400 }
      )
    }

    // Get prices for all tickers
    const prices = await getBatchMarketPrices(tickers, forceRefresh)

    // Convert to price map
    const priceMap: Record<string, any> = {}
    prices.forEach(price => {
      priceMap[price.ticker] = price
    })

    return NextResponse.json({
      prices: priceMap,
      count: prices.length,
      cached: !forceRefresh,
    })
  } catch (error) {
    console.error('Error fetching batch prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batch prices' },
      { status: 500 }
    )
  }
}
