-- Portfolio Tracker Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  security_type VARCHAR(50) NOT NULL CHECK (security_type IN ('Stocks', 'ETFs', 'Crypto', 'Gold', 'Bonds', 'Private Investment')),
  shares DECIMAL(18, 8) NOT NULL,
  purchase_price DECIMAL(18, 8) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  country VARCHAR(50),
  exchange VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_positive_shares CHECK (shares > 0),
  CONSTRAINT check_positive_purchase_price CHECK (purchase_price >= 0)
);

-- ============================================
-- CASH ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cash_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  balance DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_positive_balance CHECK (balance >= 0)
);

-- ============================================
-- SNAPSHOTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_net_worth DECIMAL(18, 2) NOT NULL,
  total_assets_value DECIMAL(18, 2) NOT NULL,
  total_cash_value DECIMAL(18, 2) NOT NULL,
  assets_breakdown JSONB NOT NULL,
  cash_breakdown JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_positive_net_worth CHECK (total_net_worth >= 0)
);

-- ============================================
-- AI ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('daily_summary', 'custom_query', 'chat')),
  context JSONB NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MARKET CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS market_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker VARCHAR(50) NOT NULL,
  price DECIMAL(18, 8) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  source VARCHAR(50) NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================
-- FX CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fx_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(18, 8) NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_ticker ON assets(ticker);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(security_type);

-- Snapshots indexes
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON snapshots(date DESC);

-- Market cache indexes
CREATE INDEX IF NOT EXISTS idx_market_cache_ticker ON market_cache(ticker);
CREATE INDEX IF NOT EXISTS idx_market_cache_expires ON market_cache(expires_at);

-- FX cache indexes
CREATE INDEX IF NOT EXISTS idx_fx_cache_expires ON fx_cache(expires_at);

-- AI analyses indexes
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON ai_analyses(analysis_type, created_at DESC);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Asset Holdings with Current Value View
CREATE OR REPLACE VIEW asset_holdings_view AS
SELECT
  a.id,
  a.ticker,
  a.name,
  a.security_type,
  a.shares,
  a.purchase_price,
  mc.price AS current_price,
  (a.shares * mc.price) AS current_value,
  (a.shares * a.purchase_price) AS cost_basis,
  CASE
    WHEN a.purchase_price > 0
    THEN ((mc.price - a.purchase_price) / a.purchase_price) * 100
    ELSE 0
  END AS return_percentage,
  ((mc.price - a.purchase_price) * a.shares) AS gain_loss,
  a.currency,
  mc.currency AS price_currency,
  a.updated_at
FROM assets a
LEFT JOIN market_cache mc ON a.ticker = mc.ticker
WHERE mc.expires_at > NOW() OR mc.price IS NULL
ORDER BY COALESCE((a.shares * mc.price), 0) DESC;

-- Portfolio Summary View
CREATE OR REPLACE VIEW portfolio_summary_view AS
SELECT
  COUNT(*) AS total_assets,
  SUM(current_value) AS total_assets_value,
  SUM(cost_basis) AS total_cost_basis,
  SUM(gain_loss) AS total_gain_loss,
  AVG(return_percentage) AS avg_return
FROM asset_holdings_view
WHERE current_value IS NOT NULL;

-- ============================================
-- TRIGGER FOR UPDATED_AT TIMESTAMP
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to assets table
DROP TRIGGER IF EXISTS update_assets_updated_at ON assets;
CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to cash_accounts table
DROP TRIGGER IF EXISTS update_cash_accounts_updated_at ON cash_accounts;
CREATE TRIGGER update_cash_accounts_updated_at
  BEFORE UPDATE ON cash_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables (optional, for future multi-user support)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE fx_cache ENABLE ROW LEVEL SECURITY;

-- Allow public access (single-user app - no authentication by default)
CREATE POLICY "Enable read access for all users" ON assets FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON assets FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON assets FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON cash_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON cash_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON cash_accounts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON cash_accounts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON snapshots FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON snapshots FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON ai_analyses FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON ai_analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON market_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON market_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON market_cache FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON market_cache FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON fx_cache FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON fx_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON fx_cache FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON fx_cache FOR DELETE USING (true);
