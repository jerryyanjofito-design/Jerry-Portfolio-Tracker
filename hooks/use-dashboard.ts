import { useQuery } from '@tanstack/react-query'

// API fetchers
const fetchDashboardSummary = async () => {
  const response = await fetch('/api/dashboard/summary')
  if (!response.ok) throw new Error('Failed to fetch dashboard summary')
  return response.json()
}

const fetchAllocation = async (by: string = 'category') => {
  const response = await fetch(`/api/dashboard/allocation?by=${by}`)
  if (!response.ok) throw new Error('Failed to fetch allocation')
  return response.json()
}

const fetchPerformance = async (period: string = 'all') => {
  const response = await fetch(`/api/dashboard/performance?period=${period}`)
  if (!response.ok) throw new Error('Failed to fetch performance')
  return response.json()
}

const fetchSnapshots = async (params?: { start_date?: string; end_date?: string }) => {
  const queryParams = new URLSearchParams()
  if (params?.start_date) queryParams.append('start_date', params.start_date)
  if (params?.end_date) queryParams.append('end_date', params.end_date)

  const response = await fetch(`/api/snapshots?${queryParams}`)
  if (!response.ok) throw new Error('Failed to fetch snapshots')
  return response.json()
}

/**
 * Hook to fetch dashboard summary
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

/**
 * Hook to fetch allocation breakdown
 */
export function useAllocation(by: string = 'category') {
  return useQuery({
    queryKey: ['dashboard', 'allocation', by],
    queryFn: () => fetchAllocation(by),
  })
}

/**
 * Hook to fetch performance metrics
 */
export function usePerformance(period: string = 'all') {
  return useQuery({
    queryKey: ['dashboard', 'performance', period],
    queryFn: () => fetchPerformance(period),
  })
}

/**
 * Hook to fetch snapshots
 */
export function useSnapshots(params?: { start_date?: string; end_date?: string }) {
  return useQuery({
    queryKey: ['snapshots', params],
    queryFn: () => fetchSnapshots(params),
  })
}
