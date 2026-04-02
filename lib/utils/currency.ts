import { getCachedFXRate, updateCachedFXRate } from '@/lib/supabase/client'

// ============================================
// FX RATE SERVICE
// ============================================

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Get FX rate from cache or fetch from API
 */
export async function getFXRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // Normalize currency codes
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  // Same currency
  if (from === to) return 1

  // Try to get from cache
  const cached = await getCachedFXRate(from, to)
  if (cached && cached.rate) {
    return cached.rate
  }

  // Fetch from API
  const rate = await fetchFXRateFromAPI(from, to)

  // Cache the rate
  if (rate) {
    const expiresAt = new Date(Date.now() + CACHE_DURATION).toISOString()
    await updateCachedFXRate(from, to, rate, expiresAt)
  }

  return rate || 1
}

/**
 * Fetch FX rate from exchangerate-api.com
 */
async function fetchFXRateFromAPI(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY

  if (!apiKey) {
    console.warn('EXCHANGE_RATE_API_KEY not set, using fallback rates')
    return getFallbackRate(fromCurrency, toCurrency)
  }

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.result === 'success' && data.conversion_rate) {
      return data.conversion_rate
    }

    throw new Error('Invalid API response')
  } catch (error) {
    console.error('Error fetching FX rate:', error)
    return getFallbackRate(fromCurrency, toCurrency)
  }
}

/**
 * Fallback FX rates (hardcoded for common pairs)
 * This is used when the API is unavailable
 */
function getFallbackRate(fromCurrency: string, toCurrency: string): number | null {
  // Current approximate rates (should be updated periodically)
  const fallbackRates: Record<string, number> = {
    'SGDIDR': 11850,  // 1 SGD = 11,850 IDR
    'USDSGD': 1.35,   // 1 USD = 1.35 SGD
    'USDIDR': 16000,  // 1 USD = 16,000 IDR
    'EURUSD': 1.08,   // 1 EUR = 1.08 USD
    'GBPUSD': 1.27,   // 1 GBP = 1.27 USD
    'JPYUSD': 0.0067, // 1 JPY = 0.0067 USD
  }

  // Try direct rate
  const directKey = `${fromCurrency}${toCurrency}`
  if (fallbackRates[directKey]) {
    return fallbackRates[directKey]
  }

  // Try reverse rate
  const reverseKey = `${toCurrency}${fromCurrency}`
  if (fallbackRates[reverseKey]) {
    return 1 / fallbackRates[reverseKey]
  }

  // Try to route through USD
  const fromToUSDKey = `${fromCurrency}USD`
  const usdToToKey = `USD${toCurrency}`

  if (fallbackRates[fromToUSDKey] && fallbackRates[usdToToKey]) {
    return fallbackRates[fromToUSDKey] * fallbackRates[usdToToKey]
  }

  console.warn(`No fallback rate available for ${fromCurrency} to ${toCurrency}`)
  return null
}

/**
 * Convert currency amount
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount
  }

  const rate = await getFXRate(fromCurrency, toCurrency)
  return amount * rate
}

/**
 * Convert multiple currency amounts
 */
export async function convertCurrencies(
  amounts: Array<{ amount: number; fromCurrency: string; toCurrency?: string }>,
  targetCurrency: string = 'IDR'
): Promise<number[]> {
  const conversions = amounts.map(({ amount, fromCurrency, toCurrency }) =>
    convertCurrency(amount, fromCurrency, toCurrency || targetCurrency)
  )

  return Promise.all(conversions)
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    IDR: 'Rp',
    USD: '$',
    SGD: 'S$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  }

  return symbols[currencyCode.toUpperCase()] || currencyCode
}

/**
 * Validate currency code
 */
export function isValidCurrencyCode(code: string): boolean {
  const validCodes = ['IDR', 'USD', 'SGD', 'EUR', 'GBP', 'JPY']
  return validCodes.includes(code.toUpperCase())
}

/**
 * Format currency with symbol
 */
export function formatCurrencyWithSymbol(
  amount: number,
  currencyCode: string,
  decimals: number = 2
): string {
  const symbol = getCurrencySymbol(currencyCode)
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })

  return `${symbol}${formattedAmount}`
}
