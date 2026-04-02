import type { MarketPriceData, MarketDataProvider } from './types'

/**
 * Yahoo Finance Provider
 * Uses unofficial Yahoo Finance API (no API key required)
 */
export class YahooFinanceProvider implements MarketDataProvider {
  name = 'Yahoo Finance'
  private rateLimited = false
  private lastRequestTime = 0
  private minRequestInterval = 1000 // 1 second between requests

  /**
   * Fetch single stock price from Yahoo Finance
   */
  async fetchPrice(ticker: string): Promise<MarketPriceData | null> {
    if (this.rateLimited) {
      console.warn('Yahoo Finance rate limited')
      return null
    }

    // Respect rate limiting
    await this.rateLimitDelay()

    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.chart?.result?.[0]?.meta?.regularMarketPrice) {
        return null
      }

      const meta = data.chart.result[0].meta

      return {
        ticker,
        price: meta.regularMarketPrice,
        currency: meta.currency || 'USD',
        timestamp: new Date().toISOString(),
        provider: this.name,
      }
    } catch (error) {
      console.error('Error fetching from Yahoo Finance:', error)
      // Mark as rate limited if we get specific errors
      if (error instanceof Error && error.message.includes('429')) {
        this.rateLimited = true
      }
      return null
    }
  }

  /**
   * Fetch multiple prices from Yahoo Finance
   */
  async fetchBatchPrices(tickers: string[]): Promise<MarketPriceData[]> {
    const results: MarketPriceData[] = []

    for (const ticker of tickers) {
      const price = await this.fetchPrice(ticker)
      if (price) {
        results.push(price)
      }
      // Small delay between requests
      await this.rateLimitDelay()
    }

    return results
  }

  /**
   * Check if currently rate limited
   */
  isRateLimited(): boolean {
    return this.rateLimited
  }

  /**
   * Reset rate limit
   */
  resetRateLimit(): void {
    this.rateLimited = false
  }

  /**
   * Delay between requests to respect rate limits
   */
  private async rateLimitDelay(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      )
    }

    this.lastRequestTime = Date.now()
  }
}
