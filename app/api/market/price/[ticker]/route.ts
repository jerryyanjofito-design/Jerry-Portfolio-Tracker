import { NextRequest, NextResponse } from 'next/server'
import { getMarketPrice, getMarketPrice as getMarketPriceFromService } from '@/lib/api/market-data'
import { getFXRate } from '@/lib/utils/currency'

/**
 * GET /api/market/price/:ticker
 * Get current price for an asset
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Get price from market data service
    const priceData = await getMarketPrice(
      params.ticker,
      undefined,
      forceRefresh
    )

    if (!priceData) {
      return NextResponse.json(
        { error: 'Failed to fetch price' },
        { status: 404 }
      )
    }

    // Get IDR conversion rate if needed
    let currencyIDR = priceData.price
    if (priceData.currency !== 'IDR') {
      try {
        const fxRate = await getFXRate(priceData.currency, 'IDR')
        currencyIDR = priceData.price * fxRate
      } catch (error) {
        console.error('Error fetching FX rate:', error)
      }
    }

    return NextResponse.json({
      ticker: priceData.ticker,
      price: priceData.price,
      currency: priceData.currency,
      currency_idr: currencyIDR,
      timestamp: priceData.timestamp,
      provider: priceData.provider,
    })
  } catch (error) {
    console.error('Error fetching market price:', error)
    return NextResponse.json(
      { error: 'Failed to fetch market price' },
      { status: 500 }
    )
  }
}
