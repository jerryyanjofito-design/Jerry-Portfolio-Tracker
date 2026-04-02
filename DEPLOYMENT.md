# Portfolio & Net Worth Tracker - Vercel Deployment Guide

## Prerequisites

1. ✅ **GitHub Repository** - Make sure your code is pushed to GitHub
2. ✅ **Vercel Account** - Create a free account at [vercel.com](https://vercel.com)
3. ✅ **Environment Variables** - Have your API keys ready
4. ✅ **Supabase Database** - Project created and migrations run

## Quick Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Deploy via GitHub Integration (Alternative)

1. Push your code to GitHub
2. Go to Vercel Dashboard → Add New Project
3. Import from GitHub
4. Configure environment variables
5. Deploy

## Environment Variables for Vercel

Set these in your Vercel project settings:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `CRON_SECRET` - A secure random string for cron jobs

**Optional:**
- `AI_PROVIDER` - 'claude' or 'openai'
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI)
- `ALPHA_VANTAGE_API_KEY` - Your Alpha Vantage API key
- `EXCHANGE_RATE_API_KEY` - Your exchange rate API key
- `GOAL_AMOUNT` - 15000000000 (or your custom goal)

## Setting up Supabase Database

### Quick Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `scripts/migrations.sql`
4. Run the SQL from `scripts/seed-database.sql`

### Verify Database Connection

Your `.env.local` file should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Troubleshooting

### Common Issues

**1. Build Errors**
- If you see build errors, check that all imports use relative paths
- Ensure `package.json` has all dependencies installed

**2. Database Connection Errors**
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check your Supabase project is active
- Ensure migrations have been run

**3. API Key Errors**
- Verify API keys are correct and have proper permissions
- Check API key has access to required resources

**4. Cron Job Failures**
- Ensure `CRON_SECRET` matches in code and Vercel settings
- Check cron job URLs are correct: `/api/cron/daily-snapshot?secret=YOUR_SECRET`

## Post-Deployment

### First Steps After Deploy

1. Visit your deployed URL
2. Run database migrations in Supabase
3. Add your first asset
4. Check AI analysis works

### Monitoring

- Use Vercel dashboard logs for debugging
- Check Supabase logs for database issues
- Monitor API usage to stay within free tier limits

## Project Structure

The deployed application includes:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes for all operations
- **Database**: Supabase PostgreSQL with full schema
- **State Management**: React Query + Zustand
- **Charts**: Recharts for data visualization
- **AI**: Integration with Claude/OpenAI
- **Authentication**: Optional password-based auth
- **Cron Jobs**: Vercel cron for daily snapshots and market refresh

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

## Success Criteria

You'll know deployment is successful when:

✅ Application loads at your Vercel URL
✅ Can navigate between all pages
✅ Database tables created and accessible
✅ API routes respond correctly
✅ Charts render data properly
✅ AI analysis features work
