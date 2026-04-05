import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API fetchers
const fetchCashAccounts = async () => {
  try {
    const response = await fetch('/api/cash')
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Cash accounts endpoint not found (404)')
        return { error: 'Cash service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch cash accounts')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching cash accounts:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const fetchCashAccount = async (id: string) => {
  try {
    const response = await fetch(`/api/cash/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Cash account endpoint not found (404)')
        return { error: 'Cash service not available', success: false, data: null }
      }
      throw new Error('Failed to fetch cash account')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching cash account:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const createCashAccountFn = async (account: any) => {
  try {
    const response = await fetch('/api/cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    })
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Create cash account endpoint not found (404)')
        return { error: 'Cash service not available', success: false, data: null }
      }
      throw new Error('Failed to create cash account')
    }
    return response.json()
  } catch (error) {
    console.error('Error creating cash account:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const updateCashAccountFn = async (id: string, account: any) => {
  try {
    const response = await fetch(`/api/cash/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    })
  if (!response.ok) {
    if (response.status === 404) {
      console.warn('Update cash account endpoint not found (404)')
      return { error: 'Cash service not available', success: false, data: null }
    }
    throw new Error('Failed to update cash account')
  }
  return response.json()
  } catch (error) {
    console.error('Error updating cash account:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

const deleteCashAccountFn = async (id: string) => {
  try {
    const response = await fetch(`/api/cash/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Delete cash account endpoint not found (404)')
        return { error: 'Cash service not available', success: false, data: null }
      }
      throw new Error('Failed to delete cash account')
    }
    return response.json()
  } catch (error) {
    console.error('Error deleting cash account:', error)
    return { error: 'Service temporarily unavailable', success: false, data: null }
  }
}

/**
 * Hook to fetch all cash accounts
 */
export function useCashAccounts() {
  return useQuery({
    queryKey: ['cash'],
    queryFn: fetchCashAccounts,
  })
}

/**
 * Hook to fetch a single cash account
 */
export function useCashAccount(id: string) {
  return useQuery({
    queryKey: ['cash', id],
    queryFn: () => fetchCashAccount(id),
    enabled: !!id,
  })
}

/**
 * Hook to create a cash account
 */
export function useCreateCashAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCashAccountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash'] })
    },
  })
}

/**
 * Hook to update a cash account
 */
export function useUpdateCashAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, account }: { id: string; account: any }) =>
      updateCashAccountFn(id, account),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cash'] })
      queryClient.invalidateQueries({ queryKey: ['cash', variables.id] })
    },
  })
}

/**
 * Hook to delete a cash account
 */
export function useDeleteCashAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCashAccountFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash'] })
    },
  })
}
