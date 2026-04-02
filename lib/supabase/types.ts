// ============================================
// DATABASE TYPES
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      assets: {
        Row: {
          id: string
          ticker: string
          name: string | null
          security_type: 'Stocks' | 'ETFs' | 'Crypto' | 'Gold' | 'Bonds' | 'Private Investment'
          shares: number
          purchase_price: number
          currency: string
          country: string | null
          exchange: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticker: string
          name?: string | null
          security_type: 'Stocks' | 'ETFs' | 'Crypto' | 'Gold' | 'Bonds' | 'Private Investment'
          shares: number
          purchase_price: number
          currency?: string
          country?: string | null
          exchange?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticker?: string
          name?: string | null
          security_type?: 'Stocks' | 'ETFs' | 'Crypto' | 'Gold' | 'Bonds' | 'Private Investment'
          shares?: number
          purchase_price?: number
          currency?: string
          country?: string | null
          exchange?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cash_accounts: {
        Row: {
          id: string
          account_name: string
          currency: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_name: string
          currency: string
          balance: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_name?: string
          currency?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      snapshots: {
        Row: {
          id: string
          date: string
          total_net_worth: number
          total_assets_value: number
          total_cash_value: number
          assets_breakdown: Json
          cash_breakdown: Json
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          total_net_worth: number
          total_assets_value: number
          total_cash_value: number
          assets_breakdown: Json
          cash_breakdown: Json
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          total_net_worth?: number
          total_assets_value?: number
          total_cash_value?: number
          assets_breakdown?: Json
          cash_breakdown?: Json
          created_at?: string
        }
      }
      ai_analyses: {
        Row: {
          id: string
          analysis_type: 'daily_summary' | 'custom_query' | 'chat'
          context: Json
          response: string
          created_at: string
        }
        Insert: {
          id?: string
          analysis_type: 'daily_summary' | 'custom_query' | 'chat'
          context: Json
          response: string
          created_at?: string
        }
        Update: {
          id?: string
          analysis_type?: 'daily_summary' | 'custom_query' | 'chat'
          context?: Json
          response?: string
          created_at?: string
        }
      }
      market_cache: {
        Row: {
          id: string
          ticker: string
          price: number
          currency: string
          source: string
          cached_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          ticker: string
          price: number
          currency: string
          source: string
          cached_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          ticker?: string
          price?: number
          currency?: string
          source?: string
          cached_at?: string
          expires_at?: string
        }
      }
      fx_cache: {
        Row: {
          id: string
          from_currency: string
          to_currency: string
          rate: number
          cached_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          from_currency: string
          to_currency: string
          rate: number
          cached_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          from_currency?: string
          to_currency?: string
          rate?: number
          cached_at?: string
          expires_at?: string
        }
      }
    }
    Views: {
      asset_holdings_view: {
        Row: {
          id: string
          ticker: string
          name: string | null
          security_type: string
          shares: number
          purchase_price: number
          current_price: number | null
          current_value: number | null
          cost_basis: number
          return_percentage: number
          gain_loss: number | null
          currency: string
          price_currency: string | null
          updated_at: string
        }
      }
      portfolio_summary_view: {
        Row: {
          total_assets: number
          total_assets_value: number | null
          total_cost_basis: number | null
          total_gain_loss: number | null
          avg_return: number | null
        }
      }
    }
  }
}

// ============================================
// APPLICATION TYPES
// ============================================

export type Asset = Database['public']['Tables']['assets']['Row']
export type AssetInsert = Database['public']['Tables']['assets']['Insert']
export type AssetUpdate = Database['public']['Tables']['assets']['Update']

export type CashAccount = Database['public']['Tables']['cash_accounts']['Row']
export type CashAccountInsert = Database['public']['Tables']['cash_accounts']['Insert']
export type CashAccountUpdate = Database['public']['Tables']['cash_accounts']['Update']

export type Snapshot = Database['public']['Tables']['snapshots']['Row']
export type SnapshotInsert = Database['public']['Tables']['snapshots']['Insert']

export type AIAnalysis = Database['public']['Tables']['ai_analyses']['Row']
export type AIAnalysisInsert = Database['public']['Tables']['ai_analyses']['Insert']

export type MarketCache = Database['public']['Tables']['market_cache']['Row']
export type MarketCacheInsert = Database['public']['Tables']['market_cache']['Insert']

export type FXCache = Database['public']['Tables']['fx_cache']['Row']
export type FXCacheInsert = Database['public']['Tables']['fx_cache']['Insert']

export type AssetHolding = Database['public']['Views']['asset_holdings_view']['Row']
export type PortfolioSummary = Database['public']['Views']['portfolio_summary_view']['Row']

// ============================================
// PORTFOLIO CALCULATION TYPES
// ============================================

export interface PortfolioCalculations {
  totalAssetsValue: number
  totalCashValue: number
  totalNetWorth: number
  totalCostBasis: number
  totalGainLoss: number
  totalReturnPercentage: number
  allocation: AllocationBreakdown
}

export interface AllocationBreakdown {
  Stocks: number
  ETFs: number
  Crypto: number
  Gold: number
  Bonds: number
  PrivateInvestment: number
  Cash: number
}

export interface AssetAllocationItem {
  category: string
  value: number
  percentage: number
  color: string
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface MarketPriceData {
  ticker: string
  price: number
  currency: string
  currency_idr?: number
  timestamp: string
  provider: string
}

export interface FXRateData {
  from: string
  to: string
  rate: number
  timestamp: string
}

export interface DashboardSummary {
  net_worth: number
  goal_progress: number
  total_assets: number
  total_cash: number
  daily_change: number
  daily_change_percentage: number
  allocation: AssetAllocationItem[]
  top_performers: AssetHolding[]
}

export interface PerformanceMetrics {
  period: string
  start_value: number
  end_value: number
  change: number
  change_percentage: number
  chart_data: ChartDataPoint[]
}

export interface ChartDataPoint {
  date: string
  value: number
}

// ============================================
// AI TYPES
// ============================================

export interface AIDailyAnalysis {
  analysis: string
  insights: Insight[]
  generated_at: string
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral'
  message: string
  asset?: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AIChatResponse {
  response: string
  suggested_queries: string[]
}

// ============================================
// UTILITY TYPES
// ============================================

export type SecurityType = Asset['security_type']

export type CurrencyCode = 'IDR' | 'USD' | 'SGD' | 'EUR' | 'GBP' | 'JPY'

export type SortOrder = 'asc' | 'desc'

export type SortField = 'ticker' | 'name' | 'security_type' | 'shares' | 'purchase_price' | 'current_value' | 'return_percentage'

export type DateRange = {
  start_date: string
  end_date: string
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  success: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}
