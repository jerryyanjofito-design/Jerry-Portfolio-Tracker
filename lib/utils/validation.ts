import { z } from 'zod'

// ============================================
// ASSET VALIDATION SCHEMAS
// ============================================

export const securityTypeEnum = z.enum([
  'Stocks',
  'ETFs',
  'Crypto',
  'Gold',
  'Bonds',
  'Private Investment',
])

export const currencyEnum = z.enum(['IDR', 'USD', 'SGD', 'EUR', 'GBP', 'JPY'])

export const assetSchema = z.object({
  ticker: z.string()
    .min(1, 'Ticker is required')
    .max(50, 'Ticker must be less than 50 characters')
    .toUpperCase(),
  name: z.string().max(255).optional(),
  security_type: securityTypeEnum,
  shares: z.number()
    .positive('Shares must be greater than 0')
    .max(999999999.99999999, 'Shares value too large'),
  purchase_price: z.number()
    .nonnegative('Purchase price cannot be negative')
    .max(999999999.99999999, 'Purchase price value too large'),
  currency: currencyEnum.default('IDR'),
  country: z.string().max(50).optional(),
  exchange: z.string().max(50).optional(),
})

export const updateAssetSchema = assetSchema.partial().extend({
  id: z.string().uuid('Invalid asset ID'),
})

export type AssetFormData = z.infer<typeof assetSchema>
export type UpdateAssetFormData = z.infer<typeof updateAssetSchema>

// ============================================
// CASH ACCOUNT VALIDATION SCHEMAS
// ============================================

export const cashAccountSchema = z.object({
  account_name: z.string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be less than 100 characters'),
  currency: currencyEnum,
  balance: z.number()
    .nonnegative('Balance cannot be negative')
    .max(999999999999.99, 'Balance value too large'),
})

export const updateCashAccountSchema = cashAccountSchema.partial().extend({
  id: z.string().uuid('Invalid cash account ID'),
})

export type CashAccountFormData = z.infer<typeof cashAccountSchema>
export type UpdateCashAccountFormData = z.infer<typeof updateCashAccountSchema>

// ============================================
// MARKET DATA VALIDATION SCHEMAS
// ============================================

export const marketPriceSchema = z.object({
  ticker: z.string().min(1),
  price: z.number().positive('Price must be positive'),
  currency: currencyEnum,
})

export type MarketPriceData = z.infer<typeof marketPriceSchema>

// ============================================
// SNAPSHOT VALIDATION SCHEMAS
// ============================================

export const snapshotSchema = z.object({
  date: z.string().refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Invalid date format'),
  total_net_worth: z.number().nonnegative('Net worth cannot be negative'),
  total_assets_value: z.number().nonnegative('Assets value cannot be negative'),
  total_cash_value: z.number().nonnegative('Cash value cannot be negative'),
  assets_breakdown: z.record(z.number()),
  cash_breakdown: z.record(z.number()),
})

export type SnapshotFormData = z.infer<typeof snapshotSchema>

// ============================================
// AI QUERY VALIDATION SCHEMAS
// ============================================

export const customAnalysisSchema = z.object({
  assets: z.array(z.string()).optional(),
  question: z.string()
    .min(10, 'Question must be at least 10 characters')
    .max(1000, 'Question must be less than 1000 characters'),
})

export type CustomAnalysisFormData = z.infer<typeof customAnalysisSchema>

export const chatQuerySchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters'),
  context: z.record(z.any()).optional(),
})

export type ChatQueryFormData = z.infer<typeof chatQuerySchema>

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate ticker format
 */
export function isValidTicker(ticker: string): boolean {
  // Tickers are typically 1-5 characters for stocks, can be longer for crypto
  return /^[A-Z0-9.-]{1,20}$/.test(ticker.toUpperCase())
}

/**
 * Validate currency code
 */
export function isValidCurrency(currency: string): boolean {
  return ['IDR', 'USD', 'SGD', 'EUR', 'GBP', 'JPY'].includes(currency.toUpperCase())
}

/**
 * Validate number range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Validate positive number
 */
export function isPositive(value: number): boolean {
  return value > 0
}

/**
 * Validate non-negative number
 */
export function isNonNegative(value: number): boolean {
  return value >= 0
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validate date is in the past or today
 */
export function isPastOrToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return d <= today
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  return d > now
}

/**
 * Validate date is within range
 */
export function isDateInRange(date: Date | string, minDays: number, maxDays: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffDays = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays >= minDays && diffDays <= maxDays
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate cron secret
 */
export function isValidCronSecret(secret: string): boolean {
  return secret.length >= 16
}

/**
 * Validate API key format (basic check)
 */
export function isValidAPIKey(key: string): boolean {
  return key.length >= 10
}
