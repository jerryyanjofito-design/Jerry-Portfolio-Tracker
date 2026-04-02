# Portfolio & Net Worth Tracker

A modern, single-user portfolio tracking application built with Next.js 14, Supabase, and free-tier APIs.

## Features

- Track multiple asset classes (Stocks, ETFs, Crypto, Gold, Bonds, Private Investment, Cash)
- Real-time market data integration (Yahoo Finance, CoinGecko, Alpha Vantage)
- Currency conversion (SGD to IDR via exchangerate-api.com)
- Dashboard with net worth display and goal progress (15,000,000,000 IDR)
- Historical performance charts from daily snapshots
- Asset allocation pie charts
- AI-powered portfolio analysis (OpenAI/Claude support)
- Simple password-based authentication (optional)
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query, Zustand
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase project (free tier)
- API keys for external services (optional, free tiers available)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd portfolio-tracker
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
APP_PASSWORD=your-optional-password
CRON_SECRET=generate-random-secret
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-anthropic-api-key
```

4. Set up Supabase database

Run the database migrations in the Supabase SQL editor (see `scripts/migrations.sql`).

5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Create the following tables in Supabase:

- `assets` - Asset holdings
- `cash_accounts` - Cash holdings
- `snapshots` - Daily portfolio snapshots
- `ai_analyses` - Cached AI responses
- `market_cache` - Cached market prices
- `fx_cache` - Cached FX rates

See the database schema documentation for details.

## Project Structure

```
portfolio-tracker/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── holdings/          # Holdings page
│   ├── cash/              # Cash accounts page
│   ├── analysis/          # AI analysis page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── charts/           # Chart components
│   ├── forms/            # Form components
│   └── ...
├── lib/                   # Core utilities
│   ├── supabase/         # Supabase client
│   ├── api/              # API abstractions
│   └── utils/            # Helper functions
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── scripts/              # Database scripts
```

## API Endpoints

### Assets
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Cash Accounts
- `GET /api/cash` - List all accounts
- `POST /api/cash` - Create cash account
- `PUT /api/cash/:id` - Update account
- `DELETE /api/cash/:id` - Delete account

### Dashboard
- `GET /api/dashboard/summary` - Dashboard overview
- `GET /api/dashboard/allocation` - Asset allocation
- `GET /api/dashboard/performance` - Performance metrics

### AI Features
- `GET /api/ai/daily-analysis` - Daily AI summary
- `POST /api/ai/custom-analysis` - Custom analysis
- `POST /api/ai/chat` - AI chat assistant

### Cron Jobs
- `POST /api/cron/daily-snapshot` - Daily snapshot job
- `POST /api/cron/refresh-markets` - Market refresh job

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Cron Jobs

Configure cron jobs in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/daily-snapshot",
    "schedule": "0 23 * * *"
  }]
}
```

## Preloaded Data

The application includes these preloaded accounts:

- IDR — Indodax
- SGD — DBS
- IDR — Expresi
- IDR — Other
- IDR — Studioverse
- Studioverse Investment (private investment)

## License

MIT

## Contributing

This is a personal project. For questions or suggestions, please open an issue.
