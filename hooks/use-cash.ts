import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API fetchers
const fetchCashAccounts = async () => {
  const response = await fetch('/api/cash')
  if (!response.ok) throw new Error('Failed to fetch cash accounts')
  return response.json()
}

const fetchCashAccount = async (id: string) => {
  const response = await fetch(`/api/cash/${id}`)
  if (!response.ok) throw new Error('Failed to fetch cash account')
  return response.json()
}

const createCashAccountFn = async (account: any) => {
  const response = await fetch('/api/cash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  })
  if (!response.ok) throw new Error('Failed to create cash account')
  return response.json()
}

const updateCashAccountFn = async (id: string, account: any) => {
  const response = await fetch(`/api/cash/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  })
  if (!response.ok) throw new Error('Failed to update cash account')
  return response.json()
}

const deleteCashAccountFn = async (id: string) => {
  const response = await fetch(`/api/cash/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete cash account')
  return response.json()
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
