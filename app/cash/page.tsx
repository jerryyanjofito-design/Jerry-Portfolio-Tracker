'use client'

import { useState } from 'react'
import { useCashAccounts, useCreateCashAccount, useUpdateCashAccount, useDeleteCashAccount } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatIDR } from '@/lib/utils/formatting'
import { Badge } from '@/components/ui/badge'
import { CashAccount } from '@/types'

export default function CashPage() {
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)

  const { data: cashData, isLoading } = useCashAccounts()
  const createCashAccount = useCreateCashAccount()
  const updateCashAccount = useUpdateCashAccount()
  const deleteCashAccount = useDeleteCashAccount()

  const handleEdit = (account: any) => {
    setEditingAccount(account)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this cash account?')) {
      await deleteCashAccount.mutateAsync(id)
    }
  }

  const handleCreate = () => {
    setEditingAccount(null)
    setShowModal(true)
  }

  const handleSubmit = async (formData: any) => {
    try {
      if (editingAccount) {
        await updateCashAccount.mutateAsync({
          id: editingAccount.id,
          account: formData,
        })
      } else {
        await createCashAccount.mutateAsync(formData)
      }
      setShowModal(false)
      setEditingAccount(null)
    } catch (error) {
      console.error('Error saving cash account:', error)
      alert('Failed to save cash account. Please try again.')
    }
  }

  const getCurrencyColor = (currency: string) => {
    const colors: Record<string, any> = {
      IDR: 'default',
      USD: 'success',
      SGD: 'warning',
      EUR: 'secondary',
      GBP: 'secondary',
      JPY: 'secondary',
    }
    return colors[currency] || 'default'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cash Accounts
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your cash holdings across different currencies
            </p>
          </div>
          <Button onClick={handleCreate}>
            + Add Cash Account
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Cash Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cashData?.accounts?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value (IDR)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatIDR(cashData?.total_idr || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Breakdown */}
        {cashData?.breakdown_by_currency && Object.keys(cashData.breakdown_by_currency).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Currency Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(cashData.breakdown_by_currency).map(([currency, data]: [string, any]) => (
                  <div key={currency} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getCurrencyColor(currency)}>
                        {currency}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatIDR(data.idr_equivalent)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cash Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">
              Cash Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!cashData?.accounts || cashData.accounts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No cash accounts yet. Add your first cash account to get started!
              </div>
            ) : (
              <div className="space-y-4">
                {cashData.accounts.map((account: CashAccount) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {account.account_name}
                        </h3>
                        <Badge variant={getCurrencyColor(account.currency)}>
                          {account.currency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatIDR(account.balance)}
                      </p>
                      <p className="text-xs text-gray-500">
                        ≈ {formatIDR(account.idr_equivalent)} IDR
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(account)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(account.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Account Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAccount ? 'Edit Cash Account' : 'Add Cash Account'}
                </h2>
              </div>

              <CashAccountForm
                account={editingAccount}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false)
                  setEditingAccount(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function CashAccountForm({
  account,
  onSubmit,
  onCancel,
}: {
  account: any
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    account_name: account?.account_name || '',
    currency: account?.currency || 'IDR',
    balance: account?.balance || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      balance: Number(formData.balance),
    })
  }

  const currencies = ['IDR', 'USD', 'SGD', 'EUR', 'GBP', 'JPY']

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <Input
        label="Account Name *"
        id="account_name"
        placeholder="e.g., IDR - Indodax"
        value={formData.account_name}
        onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
        required
      />

      <Select
        label="Currency *"
        id="currency"
        value={formData.currency}
        onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
        options={currencies.map(currency => ({ value: currency, label: currency }))}
      />

      <Input
        label="Balance *"
        id="balance"
        type="number"
        step="0.01"
        placeholder="e.g., 50000000"
        value={formData.balance}
        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
        required
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {account ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  )
}
