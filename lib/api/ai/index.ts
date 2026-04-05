import { ClaudeProvider } from './claude'
import { OpenAIProvider } from './openai'
import type { AIProvider, DailyAnalysisContext, CustomAnalysisContext, ChatContext } from './types'
import { createAIAnalysis, getLatestDailyAnalysis } from '@/lib/supabase/client'

// ============================================
// AI SERVICE
// ============================================

// Get provider from environment
const providerName = process.env.AI_PROVIDER?.toLowerCase() || 'claude'
const provider: AIProvider =
  providerName === 'openai' ? new OpenAIProvider() : new ClaudeProvider()

/**
 * Get the current AI provider
 */
export function getAIProvider(): AIProvider {
  return provider
}

/**
 * Check if AI provider is available
 */
export function isAIAvailable(): boolean {
  if (provider instanceof ClaudeProvider) {
    return provider.isAvailable()
  }
  if (provider instanceof OpenAIProvider) {
    return provider.isAvailable()
  }
  return false
}

/**
 * ============================================
 * PROMPT TEMPLATES
 * ============================================
 */

const SYSTEM_PROMPT = `You are a helpful financial assistant for a personal portfolio tracking application.
Your role is to provide clear, concise, and actionable insights about portfolio performance.
Always be accurate, balanced, and educational. Never provide specific investment advice - focus on analysis and insights.`

const DAILY_ANALYSIS_PROMPT = (context: DailyAnalysisContext): string => `
You are a financial analyst providing a daily portfolio summary.

PORTFOLIO SUMMARY:
- Total Net Worth: ${formatIDR(context.portfolio.totalNetWorth)}
- Total Assets: ${formatIDR(context.portfolio.totalAssets)}
- Total Cash: ${formatIDR(context.portfolio.totalCash)}
- Daily Change: ${formatIDR(context.portfolio.dailyChange)} (${context.portfolio.dailyChangePercentage.toFixed(2)}%)
- Date: ${context.date}

TOP PERFORMERS:
${context.topPerformers.map(p => `- ${p.ticker} (${p.name || 'N/A'}): ${p.returnPercentage.toFixed(2)}%`).join('\n')}

WORST PERFORMERS:
${context.worstPerformers.map(p => `- ${p.ticker} (${p.name || 'N/A'}): ${p.returnPercentage.toFixed(2)}%`).join('\n')}

ALLOCATION:
${Object.entries(context.allocation)
  .filter(([_, value]) => value > 0)
  .map(([category, value]) => `- ${category}: ${formatIDR(value)}`)
  .join('\n')}

Please provide:
1. A brief summary of today's portfolio performance
2. Key insights about the top and worst performers
3. Observations about portfolio diversification
4. Any notable patterns or trends

Format your response in a clear, newsletter-style format with headings and bullet points where appropriate.
Keep it concise but informative.`

const CUSTOM_ANALYSIS_PROMPT = (context: CustomAnalysisContext): string => `
You are a financial analyst providing targeted portfolio analysis.

QUESTION: ${context.question}

${context.portfolio ? `
PORTFOLIO OVERVIEW:
- Total Net Worth: ${formatIDR(context.portfolio.totalNetWorth)}
- Allocation:
${Object.entries(context.portfolio.allocation)
  .filter(([_, value]) => value > 0)
  .map(([category, value]) => `  - ${category}: ${formatIDR(value)}`)
  .join('\n')}
` : ''}

${context.assets && context.assets.length > 0 ? `
ASSETS IN FOCUS:
${context.assets.map(a => `
  - ${a.ticker} (${a.name || 'N/A'})
    Type: ${a.securityType}
    Value: ${formatIDR(a.currentValue)}
    Return: ${a.returnPercentage.toFixed(2)}%
`).join('\n')}
` : ''}

Please provide a clear, focused analysis addressing the user's question.
Include specific data points to support your insights.
Be honest about limitations in the data.`

const CHAT_PROMPT = (context: ChatContext): string => `
You are a helpful financial assistant for a portfolio tracking application.

${context.portfolio ? `
CURRENT PORTFOLIO:
- Total Net Worth: ${formatIDR(context.portfolio.totalNetWorth)}
- Allocation:
${Object.entries(context.portfolio.allocation)
  .filter(([_, value]) => value > 0)
  .map(([category, value]) => `  - ${category}: ${formatIDR(value)}`)
  .join('\n')}
` : ''}

${context.portfolio?.topPerformers ? `
TOP PERFORMERS:
${context.portfolio.topPerformers.map(p => `- ${p.ticker}: ${p.returnPercentage.toFixed(2)}%`).join('\n')}
` : ''}

${context.portfolio?.worstPerformers ? `
WORST PERFORMERS:
${context.portfolio.worstPerformers.map(p => `- ${p.ticker}: ${p.returnPercentage.toFixed(2)}%`).join('\n')}
` : ''}

USER QUESTION: ${context.userQuestion}

Provide a helpful, informative response. Use the portfolio data provided to give specific insights.
If you don't have enough information to answer thoroughly, let the user know what additional data would be helpful.`

/**
 * ============================================
 * AI FUNCTIONS
 * ============================================
 */

/**
 * Generate daily portfolio analysis
 */
export async function generateDailyAnalysis(context: DailyAnalysisContext): Promise<string> {
  const prompt = DAILY_ANALYSIS_PROMPT(context)

  try {
    const response = await provider.generateResponse(prompt)

    // Cache the response
    await createAIAnalysis({
      analysis_type: 'daily_summary',
      context: context as any,
      response,
    })

    return response
  } catch (error) {
    console.error('Error generating daily analysis:', error)
    // Return a safe fallback response
    return JSON.stringify({
      success: false,
      data: null,
      error: 'AI analysis temporarily unavailable'
    })
  }
}

/**
 * Get or generate daily analysis
 */
export async function getDailyAnalysis(context: DailyAnalysisContext): Promise<string> {
  // Try to get cached analysis
  const cached = await getLatestDailyAnalysis()

  // Check if cached analysis is from today
  const today = new Date().toISOString().split('T')[0]
  if (cached && (cached as { created_at: string }).created_at.startsWith(today)) {
    return (cached as { response: string }).response
  }

  // Generate new analysis
  return await generateDailyAnalysis(context)
}

/**
 * Generate custom analysis
 */
export async function generateCustomAnalysis(context: CustomAnalysisContext): Promise<string> {
  const prompt = CUSTOM_ANALYSIS_PROMPT(context)

  const response = await provider.generateResponse(prompt, context)

  // Cache the response
  await createAIAnalysis({
    analysis_type: 'custom_query',
    context: context as any,
    response,
  })

  return response
}

/**
 * Generate chat response
 */
export async function generateChatResponse(context: ChatContext): Promise<string> {
  const prompt = CHAT_PROMPT(context)

  const response = await provider.generateResponse(prompt, context)

  // Cache the response
  await createAIAnalysis({
    analysis_type: 'chat',
    context: context as any,
    response,
  })

  return response
}

/**
 * Generate chat response with message history
 */
export async function generateChatMessage(messages: Array<{ role: string; content: string }>, context: ChatContext): Promise<string> {
  // Add system prompt
  const messagesWithSystem = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
  ]

  const response = await provider.generateChatMessage(messagesWithSystem)

  // Cache the response
  await createAIAnalysis({
    analysis_type: 'chat',
    context: { ...context, messages } as any,
    response,
  })

  return response
}

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get suggested follow-up questions
 */
export function getSuggestedQuestions(question: string): string[] {
  const lowerQuestion = question.toLowerCase()

  // Suggest follow-up questions based on the user's query
  const suggestions: string[] = []

  if (lowerQuestion.includes('down') || lowerQuestion.includes('lose')) {
    suggestions.push(
      'Which assets performed worst today?',
      'What should I do about my losses?'
    )
  }

  if (lowerQuestion.includes('diversif')) {
    suggestions.push(
      'How can I improve my diversification?',
      'What categories am I missing?'
    )
  }

  if (lowerQuestion.includes('rebalanc')) {
    suggestions.push(
      'What should I sell to rebalance?',
      'What should I buy more of?'
    )
  }

  if (lowerQuestion.includes('performance') || lowerQuestion.includes('return')) {
    suggestions.push(
      'How has my portfolio performed this month?',
      'What is my best-performing asset?'
    )
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      'How is my diversification?',
      'What should I rebalance?',
      'Which assets performed best this week?'
    )
  }

  return suggestions
}
