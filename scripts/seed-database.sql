-- Portfolio Tracker Seed Data
-- Run this in Supabase SQL Editor after running migrations.sql

-- ============================================
-- PRELOADED CASH ACCOUNTS
-- ============================================

-- IDR - Indodax
INSERT INTO cash_accounts (account_name, currency, balance)
VALUES ('IDR - Indodax', 'IDR', 0)
ON CONFLICT DO NOTHING;

-- SGD - DBS
INSERT INTO cash_accounts (account_name, currency, balance)
VALUES ('SGD - DBS', 'SGD', 0)
ON CONFLICT DO NOTHING;

-- IDR - Expresi
INSERT INTO cash_accounts (account_name, currency, balance)
VALUES ('IDR - Expresi', 'IDR', 0)
ON CONFLICT DO NOTHING;

-- IDR - Other
INSERT INTO cash_accounts (account_name, currency, balance)
VALUES ('IDR - Other', 'IDR', 0)
ON CONFLICT DO NOTHING;

-- IDR - Studioverse
INSERT INTO cash_accounts (account_name, currency, balance)
VALUES ('IDR - Studioverse', 'IDR', 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- STUDIOVERSE INVESTMENT (PRIVATE INVESTMENT)
-- ============================================

-- Studioverse Investment (treated as a private investment asset, not a cash account)
INSERT INTO assets (ticker, name, security_type, shares, purchase_price, currency)
VALUES ('STUDIO', 'Studioverse Investment', 'Private Investment', 1, 0, 'IDR')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================

-- Uncomment the following sections if you want sample data for testing

-- Sample Stock
-- INSERT INTO assets (ticker, name, security_type, shares, purchase_price, currency, country, exchange)
-- VALUES ('BBCA.JK', 'Bank Central Asia Tbk', 'Stocks', 100, 9200, 'IDR', 'Indonesia', 'IDX')
-- ON CONFLICT DO NOTHING;

-- Sample Crypto
-- INSERT INTO assets (ticker, name, security_type, shares, purchase_price, currency)
-- VALUES ('BTC', 'Bitcoin', 'Crypto', 0.001, 950000000, 'IDR')
-- ON CONFLICT DO NOTHING;

-- Sample ETF
-- INSERT INTO assets (ticker, name, security_type, shares, purchase_price, currency, country, exchange)
-- VALUES ('G3B.SI', 'Nikko AM STI ETF', 'ETFs', 100, 3.50, 'SGD', 'Singapore', 'SGX')
-- ON CONFLICT DO NOTHING;

-- Sample Gold
-- INSERT INTO assets (ticker, name, security_type, shares, purchase_price, currency)
-- VALUES ('XAU', 'Gold', 'Gold', 1, 1200000000, 'IDR')
-- ON CONFLICT DO NOTHING;

-- Update cash account balances (uncomment to add sample balances)
-- UPDATE cash_accounts SET balance = 50000000 WHERE account_name = 'IDR - Indodax';
-- UPDATE cash_accounts SET balance = 1000 WHERE account_name = 'SGD - DBS';
-- UPDATE cash_accounts SET balance = 25000000 WHERE account_name = 'IDR - Expresi';
