export interface AIProvider {
  name: string
  generateResponse(prompt: string, context?: any): Promise<string>
  generateChatMessage(messages: ChatMessage[]): Promise<string>
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIAnalysis {
  type: 'daily_summary' | 'custom_query' | 'chat'
  response: string
  metadata?: any
}

export interface DailyAnalysisContext {
  portfolio: {
    totalNetWorth: number
    totalAssets: number
    totalCash: number
    dailyChange: number
    dailyChangePercentage: number
  }
  topPerformers: Array<{
    ticker: string
    name: string
    returnPercentage: number
  }>
  worstPerformers: Array<{
    ticker: string
    name: string
    returnPercentage: number
  }>
  allocation: Record<string, number>
  date: string
}

export interface CustomAnalysisContext {
  question: string
  assets?: Array<{
    ticker: string
    name: string
    securityType: string
    currentValue: number
    returnPercentage: number
  }>
  portfolio?: {
    totalNetWorth: number
    allocation: Record<string, number>
  }
}

export interface ChatContext {
  portfolio?: {
    totalNetWorth: number
    allocation: Record<string, number>
    topPerformers: any[]
    worstPerformers: any[]
  }
  recentSnapshots?: any[]
  userQuestion: string
}
