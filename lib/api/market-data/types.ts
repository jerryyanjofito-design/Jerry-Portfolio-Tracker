export interface MarketPriceData {
  ticker: string
  price: number
  currency: string
  timestamp: string
  provider: string
}

export interface MarketDataProvider {
  name: string
  fetchPrice(ticker: string): Promise<MarketPriceData | null>
  fetchBatchPrices(tickers: string[]): Promise<MarketPriceData[]>
  isRateLimited(): boolean
}

export interface YahooFinanceQuote {
  regularMarketPrice?: number
  currency?: string
  regularMarketTime?: number
}

export interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string
    '05. price': string
    '08. previous close': string
  }
}

export interface CoinGeckoPriceData {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  last_updated: string
}

export interface FetchOptions {
  timeout?: number
  retries?: number
  useCache?: boolean
}
