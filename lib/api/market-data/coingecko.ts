import type { MarketPriceData, MarketDataProvider, CoinGeckoPriceData } from './types'

/**
 * CoinGecko Provider
 * Uses CoinGecko API (free tier: 30 calls/minute)
 * No API key required for free tier
 */
export class CoinGeckoProvider implements MarketProvider {
  name = 'CoinGecko'
  private rateLimited = false
  private lastRequestTime = 0
  private minRequestInterval = 2000 // 2 seconds between requests

  /**
   * CoinGecko ID mapping for common cryptocurrencies
   */
  private coinIdMap: Record<string, string> = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    ADA: 'cardano',
    SOL: 'solana',
    DOT: 'polkadot',
    DOGE: 'dogecoin',
    XRP: 'ripple',
    USDT: 'tether',
    USDC: 'usd-coin',
    MATIC: 'matic-network',
    LINK: 'chainlink',
    AVAX: 'avalanche-2',
    UNI: 'uniswap',
    ATOM: 'cosmos',
    LTC: 'litecoin',
    XLM: 'stellar',
    ALGO: 'algorand',
    VET: 'vechain',
  }

  /**
   * Fetch single crypto price from CoinGecko
   */
  async fetchPrice(ticker: string): Promise<MarketPriceData | null> {
    if (this.rateLimited) {
      console.warn('CoinGecko rate limited')
      return null
    }

    await this.rateLimitDelay()

    try {
      // Map ticker to CoinGecko ID
      const coinId = this.getCoinId(ticker)
      if (!coinId) {
        console.warn(`No CoinGecko ID found for ticker: ${ticker}`)
        return null
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
      )

      if (!response.ok) {
        if (response.status === 429) {
          this.rateLimited = true
          console.warn('CoinGecko rate limited (429)')
        }
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data: CoinGeckoPriceData = await response.json()

      if (!data.current_price) {
        return null
      }

      return {
        ticker,
        price: data.current_price,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        provider: this.name,
      }
    } catch (error) {
      console.error('Error fetching from CoinGecko:', error)
      return null
    }
  }

  /**
   * Fetch multiple crypto prices from CoinGecko
   */
  async fetchBatchPrices(tickers: string[]): Promise<MarketPriceData[]> {
    // Map tickers to CoinGecko IDs
    const coinIds = tickers
      .map(ticker => this.getCoinId(ticker))
      .filter(Boolean) as string[]

    if (coinIds.length === 0) {
      return []
    }

    await this.rateLimitDelay()

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&price_change_percentage=24h`
      )

      if (!response.ok) {
        if (response.status === 429) {
          this.rateLimited = true
        }
        throw new Error(`CoinGecko API error: ${response.status}`)
      }

      const data: CoinGeckoPriceData[] = await response.json()

      return data.map(coin => ({
        ticker: this.getTickerFromId(coin.id) || coin.symbol.toUpperCase(),
        price: coin.current_price,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        provider: this.name,
      }))
    } catch (error) {
      console.error('Error fetching batch from CoinGecko:', error)
      return []
    }
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
   * Get CoinGecko coin ID from ticker
   */
  private getCoinId(ticker: string): string | null {
    return this.coinIdMap[ticker.toUpperCase()] || null
  }

  /**
   * Get ticker from CoinGecko coin ID
   */
  private getTickerFromId(coinId: string): string | null {
    const entry = Object.entries(this.coinIdMap).find(([_, id]) => id === coinId)
    return entry ? entry[0] : null
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

  /**
   * Add custom coin ID mapping
   */
  addCoinMapping(ticker: string, coinId: string): void {
    this.coinIdMap[ticker.toUpperCase()] = coinId
  }
}
