import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API fetchers
const fetchAssets = async (params?: { type?: string; sort?: string; order?: string }) => {
  try {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)

    const response = await fetch(`/api/assets?${queryParams}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Assets endpoint not found (404)')
        return { error: 'Assets service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch assets')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching assets:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const fetchAsset = async (id: string) => {
  try {
    const response = await fetch(`/api/assets/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Asset endpoint not found (404)')
        return { error: 'Asset service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch asset')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching asset:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const createAssetFn = async (asset: any) => {
  try {
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    })
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Create asset endpoint not found (404)')
        return { error: 'Assets service not available', success: false, data: null }
      }
      throw new Error('Failed to create asset')
    }
    return response.json()
  } catch (error) {
    console.error('Error creating asset:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const updateAssetFn = async (id: string, asset: any) => {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(asset),
  })
  if (!response.ok) throw new Error('Failed to update asset')
  return response.json()
}

const deleteAssetFn = async (id: string) => {
  const response = await fetch(`/api/assets/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete asset')
  return response.json()
}

/**
 * Hook to fetch all assets
 */
export function useAssets(params?: { type?: string; sort?: string; order?: string }) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => fetchAssets(params),
  })
}

/**
 * Hook to fetch a single asset
 */
export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAsset(id),
    enabled: !!id,
  })
}

/**
 * Hook to create an asset
 */
export function useCreateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAssetFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

/**
 * Hook to update an asset
 */
export function useUpdateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, asset }: { id: string; asset: any }) =>
      updateAssetFn(id, asset),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
    },
  })
}

/**
 * Hook to delete an asset
 */
export function useDeleteAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAssetFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}
