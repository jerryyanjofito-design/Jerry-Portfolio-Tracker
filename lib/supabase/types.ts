/**
 * Minimal Supabase Database types for build compatibility
 * This is a temporary fix - proper types should be regenerated using Supabase CLI
 */

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: any
        Insert: any
        Update: any
      }
      cash_accounts: {
        Row: any
        Insert: any
        Update: any
      }
      snapshots: {
        Row: any
        Insert: any
        Update: any
      }
      ai_analyses: {
        Row: any
        Insert: any
        Update: any
      }
      market_cache: {
        Row: any
        Insert: any
        Update: any
      }
      fx_cache: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}

export interface AssetAllocationItem {
  category: string
  value: number
  percentage: number
  color: string
}

export interface AssetHolding {
  id: string
  ticker: string
  name: string | null
  security_type: string
  shares: number
  purchase_price: number
  currency: string
  country: string | null
  exchange: string | null
  created_at: string
  updated_at: string
  current_price: number | null
  current_value: number | null
  cost_basis: number
  return_percentage: number
  gain_loss: number
  price_currency: string | null
}

export interface CashAccount {
  id: string
  account_name: string
  currency: string
  balance: number
  idr_equivalent: number
  created_at: string
  updated_at: string
}

export interface PortfolioCalculations {
  totalNetWorth: number
  totalAssetsValue: number
  totalCashValue: number
  assetsBreakdown: Record<string, number>
  cashBreakdown: Record<string, number>
  allocationBreakdown: Record<string, number>
  allocation: Record<string, number>
  totalGainLoss: number
  totalReturnPercentage: number
  totalCostBasis: number
  assetCount: number
  cashAccountCount: number
}

export type AllocationBreakdown = Record<string, number> & {
  Stocks: number
  ETFs: number
  Crypto: number
  Gold: number
  Bonds: number
  PrivateInvestment: number
  Cash: number
}
