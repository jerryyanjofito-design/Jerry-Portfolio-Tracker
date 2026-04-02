import type { MarketPriceData, MarketDataProvider, AlphaVantageQuote } from './types'

/**
 * Alpha Vantage Provider
 * Uses official Alpha Vantage API (free tier: 25 requests/day)
 * Requires API key
 */
export class AlphaVantageProvider implements MarketProvider {
  name = 'Alpha Vantage'
  private rateLimited = false
  private requestCount = 0
  private readonly maxRequestsPerDay = 25

  /**
   * Fetch single stock price from Alpha Vantage
   */
  async fetchPrice(ticker: string): Promise<MarketPriceData | null> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY

    if (!apiKey) {
      console.warn('Alpha Vantage API key not set')
      return null
    }

    if (this.rateLimited || this.requestCount >= this.maxRequestsPerDay) {
      console.warn('Alpha Vantage rate limited')
      return null
    }

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`
      )

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`)
      }

      const data: AlphaVantageQuote = await response.json()

      if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
        return null
      }

      this.requestCount++

      return {
        ticker,
        price: parseFloat(data['Global Quote']['05. price']),
        currency: 'USD', // Alpha Vantage returns USD by default
        timestamp: new Date().toISOString(),
        provider: this.name,
      }
    } catch (error) {
      console.error('Error fetching from Alpha Vantage:', error)
      return null
    }
  }

  /**
   * Fetch multiple prices from Alpha Vantage
   * Note: Alpha Vantage has strict rate limits, so batch requests are sequential
   */
  async fetchBatchPrices(tickers: string[]): Promise<MarketPriceData[]> {
    const results: MarketPriceData[] = []

    for (const ticker of tickers) {
      const price = await this.fetchPrice(ticker)
      if (price) {
        results.push(price)
      }
      // Delay between requests to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    return results
  }

  /**
   * Check if currently rate limited
   */
  isRateLimited(): boolean {
    return this.rateLimited || this.requestCount >= this.maxRequestsPerDay
  }

  /**
   * Get remaining requests for the day
   */
  getRemainingRequests(): number {
    return Math.max(0, this.maxRequestsPerDay - this.requestCount)
  }
}
