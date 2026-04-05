import { useQuery } from '@tanstack/react-query'

// API fetchers
const fetchDashboardSummary = async () => {
  try {
    const response = await fetch('/api/dashboard/summary')
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Dashboard summary endpoint not found (404)')
        return { error: 'Dashboard service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch dashboard summary')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const fetchAllocation = async (by: string = 'category') => {
  try {
    const response = await fetch(`/api/dashboard/allocation?by=${by}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Allocation endpoint not found (404)')
        return { error: 'Allocation service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch allocation')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching allocation:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const fetchPerformance = async (period: string = 'all') => {
  try {
    const response = await fetch(`/api/dashboard/performance?period=${period}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Performance endpoint not found (404)')
        return { error: 'Performance service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch performance')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching performance:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const fetchSnapshots = async (params?: { start_date?: string; end_date?: string }) => {
  try {
    const queryParams = new URLSearchParams()
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const response = await fetch(`/api/snapshots?${queryParams}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Snapshots endpoint not found (404)')
        return { error: 'Snapshots service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch snapshots')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
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
