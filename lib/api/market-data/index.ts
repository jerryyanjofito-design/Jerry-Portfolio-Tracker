import { YahooFinanceProvider } from './yahoo-finance'
import { AlphaVantageProvider } from './alpha-vantage'
import { CoinGeckoProvider } from './coingecko'
import type { MarketPriceData, MarketDataProvider } from './types'
import { getCachedPrice, updateCachedPrice } from '@/lib/supabase/client'

// ============================================
// MARKET DATA SERVICE
// ============================================

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

// Initialize providers
const yahooProvider = new YahooFinanceProvider()
const alphaVantageProvider = new AlphaVantageProvider()
const coinGeckoProvider = new CoinGeckoProvider()

/**
 * Get the appropriate provider for a security type
 */
function getProviderForSecurityType(securityType: string): MarketDataProvider[] {
  switch (securityType) {
    case 'Crypto':
      return [coinGeckoProvider]
    case 'Stocks':
    case 'ETFs':
      // Try Yahoo Finance first, then Alpha Vantage
      return [yahooProvider, alphaVantageProvider]
    case 'Gold':
    case 'Bonds':
      return [yahooProvider, alphaVantageProvider]
    case 'Private Investment':
      // Private investments don't have market prices
      return []
    default:
      return [yahooProvider, alphaVantageProvider]
  }
}

/**
 * Detect security type from ticker
 */
function detectSecurityType(ticker: string): string {
  const upperTicker = ticker.toUpperCase()

  // CoinGecko known tickers
  const knownCrypto = [
    'BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'DOGE', 'XRP', 'USDT', 'USDC',
    'MATIC', 'LINK', 'AVAX', 'UNI', 'ATOM', 'LTC', 'XLM', 'ALGO', 'VET',
  ]

  if (knownCrypto.includes(upperTicker)) {
    return 'Crypto'
  }

  // Indonesian stocks end with .JK
  if (upperTicker.endsWith('.JK')) {
    return 'Stocks'
  }

  // Singapore stocks end with .SI
  if (upperTicker.endsWith('.SI')) {
    return 'Stocks'
  }

  // US stocks don't have suffix (most common)
  return 'Stocks'
}

/**
 * Fetch market price with caching
 */
export async function getMarketPrice(
  ticker: string,
  securityType?: string,
  forceRefresh: boolean = false
): Promise<MarketPriceData | null> {
  // Determine security type
  const type = securityType || detectSecurityType(ticker)

  // Skip private investments
  if (type === 'Private Investment') {
    return null
  }

  // Try to get from cache first
  if (!forceRefresh) {
    const cached = await getCachedPrice(ticker)
    if (cached) {
      const cachedData = cached as { price: number; currency: string; cached_at: string; source: string }
      return {
        ticker,
        price: cachedData.price,
        currency: cachedData.currency,
        timestamp: cachedData.cached_at,
        provider: cachedData.source,
      }
    }
  }

  // Get providers for this security type
  const providers = getProviderForSecurityType(type)

  // Try each provider in order
  for (const provider of providers) {
    try {
      const price = await provider.fetchPrice(ticker)

      if (price) {
        // Cache the price
        const expiresAt = new Date(Date.now() + CACHE_DURATION).toISOString()
        await updateCachedPrice(
          price.ticker,
          price.price,
          price.currency,
          price.provider,
          expiresAt
        )

        return price
      }
    } catch (error) {
      console.error(`Error fetching from ${provider.name}:`, error)
      continue
    }
  }

  console.warn(`Failed to fetch price for ${ticker}`)
  return null
}

/**
 * Fetch multiple market prices
 */
export async function getBatchMarketPrices(
  tickers: string[],
  forceRefresh: boolean = false
): Promise<MarketPriceData[]> {
  const results: MarketPriceData[] = []

  for (const ticker of tickers) {
    const price = await getMarketPrice(ticker, undefined, forceRefresh)
    if (price) {
      results.push(price)
    }
  }

  return results
}

/**
 * Fetch prices by security type (optimized batch)
 */
export async function getPricesBySecurityType(
  securityType: string,
  tickers: string[],
  forceRefresh: boolean = false
): Promise<MarketPriceData[]> {
  if (securityType === 'Crypto') {
    // CoinGecko has better batch support for crypto
    return await coinGeckoProvider.fetchBatchPrices(tickers)
  }

  // For other types, use the generic batch method
  return await getBatchMarketPrices(tickers, forceRefresh)
}

/**
 * Refresh cached market data
 */
export async function refreshMarketData(tickers?: string[]): Promise<number> {
  const assets = tickers || []

  let refreshed = 0

  for (const ticker of assets) {
    const price = await getMarketPrice(ticker, undefined, true)
    if (price) {
      refreshed++
    }
  }

  return refreshed
}

/**
 * Check if a provider is rate limited
 */
export function isProviderRateLimited(providerName: string): boolean {
  switch (providerName) {
    case 'Yahoo Finance':
      return yahooProvider.isRateLimited()
    case 'Alpha Vantage':
      return alphaVantageProvider.isRateLimited()
    case 'CoinGecko':
      return coinGeckoProvider.isRateLimited()
    default:
      return false
  }
}

/**
 * Get provider status
 */
export function getProviderStatus(): Record<string, { rateLimited: boolean; available: boolean }> {
  return {
    'Yahoo Finance': {
      rateLimited: yahooProvider.isRateLimited(),
      available: true,
    },
    'Alpha Vantage': {
      rateLimited: alphaVantageProvider.isRateLimited(),
      available: !!process.env.ALPHA_VANTAGE_API_KEY,
    },
    'CoinGecko': {
      rateLimited: coinGeckoProvider.isRateLimited(),
      available: true,
    },
  }
}

/**
 * Reset rate limits for all providers
 */
export function resetAllRateLimits(): void {
  yahooProvider.resetRateLimit()
  coinGeckoProvider.resetRateLimit()
}

/**
 * Add custom crypto mapping for CoinGecko
 */
export function addCryptoMapping(ticker: string, coinId: string): void {
  coinGeckoProvider.addCoinMapping(ticker, coinId)
}

/**
 * Get fallback price for testing purposes
 */
export function getFallbackPrice(ticker: string, securityType: string): number {
  // This is for testing when APIs are unavailable
  // Returns mock prices based on ticker hash
  const hash = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  switch (securityType) {
    case 'Crypto':
      return 10000 + (hash % 90000) // $10,000 - $100,000
    case 'Stocks':
      return 10 + (hash % 990) // $10 - $1000
    case 'Gold':
      return 50000 + (hash % 100000) // $50,000 - $150,000 (per kg)
    default:
      return 100 + (hash % 900) // $100 - $1000
  }
}
