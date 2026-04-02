# Database Scripts

This directory contains SQL scripts for setting up and managing the Portfolio Tracker database.

## Files

### `migrations.sql`
Run this script first to create the database schema. It includes:
- All required tables (assets, cash_accounts, snapshots, ai_analyses, market_cache, fx_cache)
- Indexes for performance optimization
- Views for common queries
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### `seed-database.sql`
Run this after migrations to populate the database with initial data:
- Preloaded cash accounts (IDR - Indodax, SGD - DBS, IDR - Expresi, IDR - Other, IDR - Studioverse)
- Studioverse Investment (as a private investment asset)
- Optional sample data for testing (commented out by default)

## How to Use

### In Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open a new query
4. Copy and paste the contents of `migrations.sql`
5. Click "Run" to execute
6. Open a new query
7. Copy and paste the contents of `seed-database.sql`
8. Click "Run" to execute

### Via Command Line (if you have psql installed)

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f migrations.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f seed-database.sql
```

## Verification

After running the scripts, verify your database is set up correctly:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check assets table
SELECT * FROM assets;

-- Check cash_accounts table
SELECT * FROM cash_accounts;

-- Check views
SELECT viewname FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;
```

## Resetting the Database

To reset your database:

1. Drop all tables (be careful!):
```sql
DROP TABLE IF EXISTS ai_analyses CASCADE;
DROP TABLE IF EXISTS fx_cache CASCADE;
DROP TABLE IF EXISTS market_cache CASCADE;
DROP TABLE IF EXISTS snapshots CASCADE;
DROP TABLE IF EXISTS cash_accounts CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
```

2. Drop views:
```sql
DROP VIEW IF EXISTS portfolio_summary_view;
DROP VIEW IF EXISTS asset_holdings_view;
```

3. Drop functions:
```sql
DROP FUNCTION IF EXISTS update_updated_at_column();
```

4. Re-run migrations and seed scripts.

## Notes

- The RLS policies allow public access (no authentication required by default)
- If you add authentication, update the RLS policies accordingly
- Market data and FX rate cache tables have automatic expiration
- Snapshots are created by the cron job, not manually
