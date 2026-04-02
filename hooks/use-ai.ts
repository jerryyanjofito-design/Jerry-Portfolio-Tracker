import { useQuery, useMutation } from '@tanstack/react-query'

// API fetchers
const fetchDailyAnalysis = async (forceRefresh: boolean = false) => {
  const response = await fetch(`/api/ai/daily-analysis${forceRefresh ? '?force_refresh=true' : ''}`)
  if (!response.ok) throw new Error('Failed to fetch daily analysis')
  return response.json()
}

const createCustomAnalysisFn = async (data: any) => {
  const response = await fetch('/api/ai/custom-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to generate custom analysis')
  return response.json()
}

const createChatMessageFn = async (data: any) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to generate chat response')
  return response.json()
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
