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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0052D4] to-[#0066FF] text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Cash Accounts
              </h1>
              <p className="text-lg text-blue-100 mt-2">
                Manage your cash holdings across different currencies
              </p>
            </div>
            <Button onClick={handleCreate} className="bg-white text-blue-600 hover:bg-blue-50">
              + Add Cash Account
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Cash Holdings Card */}
          <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Total Cash Holdings
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatIDR(cashData?.total_idr || 0)}
              </p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Cash Accounts</span>
                <span className="font-semibold text-blue-600">
                  {cashData?.accounts?.length || 0} accounts
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Value (IDR) Card */}
          <Card className="bg-white shadow-xl border border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Total Value (IDR)
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatIDR(cashData?.total_idr || 0)}
              </p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Available Liquidity</span>
                <span className="font-semibold text-green-600">100%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currency Breakdown */}
        {cashData?.breakdown_by_currency && Object.keys(cashData.breakdown_by_currency).length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Currency Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(cashData.breakdown_by_currency).map(([currency, data]: [string, any]) => (
                  <div key={currency} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getCurrencyColor(currency)} className="font-semibold">
                        {currency}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatIDR(data.idr_equivalent)}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">
                      {data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cash Accounts List */}
        <Card className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
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
                    className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {account.account_name}
                        </h3>
                        <Badge variant={getCurrencyColor(account.currency)} className="font-semibold">
                          {account.currency}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 font-medium">
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
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
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
