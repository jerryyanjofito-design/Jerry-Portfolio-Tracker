import { useQuery, useMutation } from '@tanstack/react-query'

// API fetchers
const fetchMarketPrice = async (ticker: string, forceRefresh: boolean = false) => {
  const response = await fetch(
    `/api/market/price/${encodeURIComponent(ticker)}${forceRefresh ? '?refresh=true' : ''}`
  )
  if (!response.ok) throw new Error('Failed to fetch market price')
  return response.json()
}

const fetchBatchPricesFn = async (data: { tickers: string[]; forceRefresh?: boolean }) => {
  const response = await fetch('/api/market/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to fetch batch prices')
  return response.json()
}

const refreshMarketDataFn = async () => {
  const response = await fetch('/api/market/refresh', {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to refresh market data')
  return response.json()
}

/**
 * Hook to fetch market price for a single ticker
 */
export function useMarketPrice(ticker: string, forceRefresh: boolean = false) {
  return useQuery({
    queryKey: ['market', 'price', ticker, forceRefresh],
    queryFn: () => fetchMarketPrice(ticker, forceRefresh),
    enabled: !!ticker,
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  })
}

/**
 * Hook to fetch batch prices
 */
export function useBatchPrices(tickers: string[], forceRefresh: boolean = false) {
  return useQuery({
    queryKey: ['market', 'batch', tickers, forceRefresh],
    queryFn: () => fetchBatchPricesFn({ tickers, forceRefresh }),
    enabled: tickers.length > 0,
  })
}

/**
 * Hook to refresh all market data
 */
export function useRefreshMarketData() {
  return useMutation({
    mutationFn: refreshMarketDataFn,
  })
}
