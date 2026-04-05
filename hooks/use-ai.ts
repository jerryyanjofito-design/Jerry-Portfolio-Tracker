import { useQuery, useMutation } from '@tanstack/react-query'

// API fetchers
const fetchDailyAnalysis = async (forceRefresh: boolean = false) => {
  try {
    const response = await fetch(`/api/ai/daily-analysis${forceRefresh ? '?force_refresh=true' : ''}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Daily analysis endpoint not found (404)')
        return { error: 'Analysis feature not available', success: false, data: null }
      }
      throw new Error('Failed to fetch daily analysis')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching daily analysis:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const createCustomAnalysisFn = async (data: any) => {
  try {
    const response = await fetch('/api/ai/custom-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Custom analysis endpoint not found (404)')
        return { error: 'Analysis feature not available', success: false, data: null }
      }
      throw new Error('Failed to generate custom analysis')
    }
    return response.json()
  } catch (error) {
    console.error('Error generating custom analysis:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const createChatMessageFn = async (data: any) => {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Chat endpoint not found (404)')
        return { error: 'Chat feature not available', success: false, data: null }
      }
      throw new Error('Failed to generate chat response')
    }
    return response.json()
  } catch (error) {
    console.error('Error generating chat response:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

/**
 * Hook to fetch daily AI analysis
 */
export function useDailyAnalysis(forceRefresh: boolean = false) {
  return useQuery({
    queryKey: ['ai', 'daily-analysis', forceRefresh],
    queryFn: () => fetchDailyAnalysis(forceRefresh),
    enabled: !forceRefresh, // Only auto-fetch if not forcing refresh
  })
}

/**
 * Hook to create custom analysis
 */
export function useCustomAnalysis() {
  return useMutation({
    mutationFn: createCustomAnalysisFn,
  })
}

/**
 * Hook to send chat message
 */
export function useChatMessage() {
  return useMutation({
    mutationFn: createChatMessageFn,
  })
}
