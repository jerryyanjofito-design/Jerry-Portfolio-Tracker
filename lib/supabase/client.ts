import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// ============================================
// DATABASE QUERY FUNCTIONS
// ============================================

// ============================================
// ASSETS QUERIES
// ============================================

export async function getAssets() {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getAssetById(id: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getAssetsByType(securityType: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('security_type', securityType)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createAsset(asset: any) {
  const { data, error } = await supabase
    .from('assets')
    .insert(asset as any)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAsset(id: string, updates: any) {
  const { data, error } = await (supabase as any)
    .from('assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAsset(id: string) {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAssetByTicker(ticker: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('ticker', ticker)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ============================================
// CASH ACCOUNTS QUERIES
// ============================================

export async function getCashAccounts() {
  const { data, error } = await supabase
    .from('cash_accounts')
    .select('*')
    .order('updated_at', { ascending: false }) // Order by most recent first

  if (error) throw error
  return data
}

export async function getCashAccountById(id: string) {
  const { data, error } = await supabase
    .from('cash_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCashAccount(account: any) {
  const { data, error } = await supabase
    .from('cash_accounts')
    .insert(account)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCashAccount(id: string, updates: any) {
  const { data, error } = await (supabase as any)
    .from('cash_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCashAccount(id: string) {
  const { error } = await supabase
    .from('cash_accounts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getTotalCashBalance() {
  const { data, error } = await supabase
    .from('cash_accounts')
    .select('balance')

  if (error) throw error

  return (data as any).reduce((total: number, account: any) => total + Number(account.balance), 0)
}

// ============================================
// SNAPSHOTS QUERIES
// ============================================

export async function getSnapshots(startDate?: string, endDate?: string) {
  let query = supabase
    .from('snapshots')
    .select('*')
    .order('date', { ascending: true })

  if (startDate) {
    query = query.gte('date', startDate)
  }

  if (endDate) {
    query = query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getLatestSnapshot() {
  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createSnapshot(snapshot: any) {
  const { data, error } = await supabase
    .from('snapshots')
    .insert(snapshot)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getSnapshotByDate(date: string) {
  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('date', date)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ============================================
// AI ANALYSES QUERIES
// ============================================

export async function getLatestDailyAnalysis() {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('analysis_type', 'daily_summary')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createAIAnalysis(analysis: any) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert(analysis)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChatHistory(limit: number = 10) {
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('*')
    .eq('analysis_type', 'chat')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.reverse() // Reverse to show oldest first
}

// ============================================
// MARKET CACHE QUERIES
// ============================================

export async function getCachedPrice(ticker: string) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('market_cache')
    .select('*')
    .eq('ticker', ticker)
    .gt('expires_at', now)
    .order('cached_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getCachedPrices(tickers: string[]) {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('market_cache')
    .select('*')
    .in('ticker', tickers)
    .gt('expires_at', now)

  if (error) throw error
  return data
}

export async function cachePrice(cache: any) {
  const { data, error } = await supabase
    .from('market_cache')
    .insert(cache)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCachedPrice(ticker: string, price: number, currency: string, source: string, expiresAt: string) {
  const now = new Date().toISOString()

  const { data, error } = await (supabase as any)
    .from('market_cache')
    .upsert({
      ticker,
      price,
      currency,
      source,
      cached_at: now,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpiredCache() {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('market_cache')
    .delete()
    .lt('expires_at', now)

  if (error) throw error
}

// ============================================
// FX CACHE QUERIES
// ============================================

export async function getCachedFXRate(fromCurrency: string, toCurrency: string) {
  const now = new Date().toISOString()

  const { data, error } = await (supabase as any)
    .from('fx_cache')
    .select('*')
    .eq('from_currency', fromCurrency.toUpperCase())
    .eq('to_currency', toCurrency.toUpperCase())
    .gt('expires_at', now)
    .order('cached_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as any
}

export async function cacheFXRate(cache: any) {
  const { data, error } = await supabase
    .from('fx_cache')
    .insert(cache)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCachedFXRate(fromCurrency: string, toCurrency: string, rate: number, expiresAt: string) {
  const now = new Date().toISOString()

  const { data, error } = await (supabase as any)
    .from('fx_cache')
    .upsert({
      from_currency: fromCurrency.toUpperCase(),
      to_currency: toCurrency.toUpperCase(),
      rate,
      cached_at: now,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpiredFXCache() {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('fx_cache')
    .delete()
    .lt('expires_at', now)

  if (error) throw error
}

// ============================================
// VIEW QUERIES
// ============================================

export async function getAssetHoldings() {
  const { data, error } = await supabase
    .from('asset_holdings_view')
    .select('*')

  if (error) throw error
  return data
}

export async function getPortfolioSummary() {
  const { data, error } = await supabase
    .from('portfolio_summary_view')
    .select('*')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}
