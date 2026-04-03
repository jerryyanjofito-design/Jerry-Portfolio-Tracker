import { NextRequest, NextResponse } from 'next/server'
import { generateChatMessage, getSuggestedQuestions } from '@/lib/api/ai'
import { getAssetHoldings, getCashAccounts, getSnapshots } from '@/lib/supabase/client'
import { getFXRate } from '@/lib/utils/currency'
import { calculatePortfolioMetrics, getTopPerformers, getWorstPerformers } from '@/lib/utils/calculations'

// Type for asset holdings with currency info
interface AssetHolding {
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
  gain_loss: number
  currency: string
  price_currency: string | null
  updated_at: string
}

// Type for cash accounts
interface CashAccount {
  id: string
  account_name: string
  currency: string
  balance: number
  created_at: string
  updated_at: string
}

/**
 * POST /api/ai/chat
 * Chat with AI assistant about portfolio
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context: userContext, messages } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get portfolio data for context
    const holdings = (await getAssetHoldings()) as AssetHolding[]
    const cashAccounts = (await getCashAccounts()) as CashAccount[]

    // Get recent snapshots
    const recentSnapshots = await getSnapshots()
    const last7DaysSnapshots = recentSnapshots.slice(-7)

    // Get FX rates
    const fxRates: Record<string, number> = {}

    const currencyList: string[] = []

    holdings.forEach(h => {
      if (h.price_currency && h.price_currency !== 'IDR') {
        currencyList.push(h.price_currency)
      }
    })

    cashAccounts.forEach(a => {
      if (a.currency && a.currency !== 'IDR') {
        currencyList.push(a.currency)
      }
    })

    const currencies = Array.from(new Set(currencyList))
    currencies.push('IDR')

    for (const currency of currencies) {
      if (currency === 'IDR') {
        fxRates['IDRIDR'] = 1
      } else {
        try {
          const rate = await getFXRate(currency, 'IDR')
          fxRates[`${currency}IDR`] = rate
        } catch (error) {
          fxRates[`${currency}IDR`] = 1
        }
      }
    }

    const portfolioMetrics = await calculatePortfolioMetrics(
      holdings,
      cashAccounts,
      fxRates
    )

    // Get top and worst performers
    const topPerformers = getTopPerformers(holdings, 5)
    const worstPerformers = getWorstPerformers(holdings, 5)

    // Build context for AI
    const context = {
      portfolio: {
        totalNetWorth: portfolioMetrics.totalNetWorth,
        allocation: portfolioMetrics.allocation,
        topPerformers,
        worstPerformers,
      },
      recentSnapshots: last7DaysSnapshots,
      userQuestion: message,
      ...userContext,
    }

    // Generate response
    let response: string
    if (messages && Array.isArray(messages)) {
      response = await generateChatMessage(messages, context)
    } else {
      response = await generateChatResponse(context)
    }

    // Get suggested follow-up questions
    const suggestedQueries = getSuggestedQuestions(message)

    return NextResponse.json({
      response,
      suggested_queries: suggestedQueries,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error generating chat response:', error)
    return NextResponse.json(
      { error: 'Failed to generate chat response' },
      { status: 500 }
    )
  }
}

async function generateChatResponse(context: any): Promise<string> {
  const { getAIProvider } = await import('@/lib/api/ai')
  const provider = getAIProvider()
  return await provider.generateResponse(
    `Portfolio context: ${JSON.stringify(context, null, 2)}`,
    context
  )
}
