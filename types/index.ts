/**
 * Shared TypeScript type definitions for the Portfolio Tracker application
 * This file consolidates type definitions used across multiple files
 * to avoid TypeScript inference issues and ensure type safety.
 */

// ============================================
// ASSET TYPES
// ============================================

export interface Asset {
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
}

export interface AssetHolding extends Asset {
  current_price: number | null
  current_value: number | null
  cost_basis: number
  return_percentage: number
  gain_loss: number
  price_currency: string | null
}

// ============================================
// CASH ACCOUNT TYPES
// ============================================

export interface CashAccount {
  id: string
  account_name: string
  currency: string
  balance: number
  idr_equivalent: number
  created_at: string
  updated_at: string
}

// ============================================
// SNAPSHOT TYPES
// ============================================

export interface Snapshot {
  id: string
  date: string
  total_net_worth: number
  total_assets_value: number
  total_cash_value: number
  assets_breakdown: Record<string, number>
  cash_breakdown: Record<string, number>
  created_at: string
}

// ============================================
// ALLOCATION TYPES
// ============================================

export type AllocationBreakdown = Record<string, number> & {
  Stocks: number
  ETFs: number
  Crypto: number
  Gold: number
  Bonds: number
  PrivateInvestment: number
  Cash: number
}
