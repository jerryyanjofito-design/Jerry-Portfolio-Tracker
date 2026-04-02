'use client'

import { useState } from 'react'
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading'
import { formatIDR, formatPercentage } from '@/lib/utils/formatting'
import { Badge } from '@/components/ui/badge'

export default function HoldingsPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [sortBy, setSortBy] = useState('current_value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showModal, setShowModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<any>(null)

  const { data: assetsData, isLoading } = useAssets({
    type: filterType || undefined,
    sort: sortBy,
    order: sortOrder,
  })

  const createAsset = useCreateAsset()
  const updateAsset = useUpdateAsset()
  const deleteAsset = useDeleteAsset()

  // Filter assets by search
  const filteredAssets = assetsData?.assets?.filter(asset =>
    asset.ticker.toLowerCase().includes(search.toLowerCase()) ||
    (asset.name && asset.name.toLowerCase().includes(search.toLowerCase()))
  ) || []

  // Security type options
  const securityTypes = [
    'Stocks',
    'ETFs',
    'Crypto',
    'Gold',
    'Bonds',
    'Private Investment',
  ]

  // Sort options
  const sortOptions = [
    { value: 'ticker', label: 'Ticker' },
    { value: 'name', label: 'Name' },
    { value: 'security_type', label: 'Type' },
    { value: 'current_value', label: 'Value' },
    { value: 'return_percentage', label: 'Return %' },
  ]

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleEdit = (asset: any) => {
    setEditingAsset(asset)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await deleteAsset.mutateAsync(id)
    }
  }

  const handleCreate = () => {
    setEditingAsset(null)
    setShowModal(true)
  }

  const handleSubmit = async (formData: any) => {
    try {
      if (editingAsset) {
        await updateAsset.mutateAsync({
          id: editingAsset.id,
          asset: formData,
        })
      } else {
        await createAsset.mutateAsync(formData)
      }
      setShowModal(false)
      setEditingAsset(null)
    } catch (error) {
      console.error('Error saving asset:', error)
      alert('Failed to save asset. Please try again.')
    }
  }

  const getSecurityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Stocks: 'default',
      ETFs: 'secondary',
      Crypto: 'success',
      Gold: 'warning',
      Bonds: 'danger',
      'Private Investment': 'secondary',
    }
    return colors[type] || 'default'
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
              Holdings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your investments and track performance
            </p>
          </div>
          <Button onClick={handleCreate}>
            + Add Asset
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Summary Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assetsData?.assets?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatIDR(assetsData?.summary?.totalValue || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Gain/Loss</p>
                <p
                  className={`text-2xl font-bold ${
                    (assetsData?.summary?.totalGainLoss || 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatIDR(assetsData?.summary?.totalGainLoss || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search by ticker or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="w-[180px]">
                <Select
                  label="Filter by Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  options={[
                    { value: '', label: 'All Types' },
                    ...securityTypes.map(type => ({ value: type, label: type })),
                  ]}
                />
              </div>

              <div className="w-[180px]">
                <Select
                  label="Sort By"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={sortOptions}
                />
              </div>

              <div className="w-[120px]">
                <Select
                  label="Order"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  options={[
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardContent className="pt-0">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {search || filterType
                  ? 'No assets match your filters'
                  : 'No assets yet. Add your first asset to get started!'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {sortOptions.map(option => (
                        <th
                          key={option.value}
                          className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort(option.value)}
                        >
                          {option.label}
                          {sortBy === option.value && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {asset.ticker}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-600">{asset.name || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getSecurityTypeColor(asset.security_type)}>
                            {asset.security_type}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900">
                            {formatIDR(asset.current_value || 0)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p
                            className={`font-medium ${
                              asset.return_percentage >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatPercentage(asset.return_percentage)}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(asset)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(asset.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                </h2>
              </div>

              <AssetForm
                asset={editingAsset}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowModal(false)
                  setEditingAsset(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function AssetForm({
  asset,
  onSubmit,
  onCancel,
}: {
  asset: any
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    ticker: asset?.ticker || '',
    name: asset?.name || '',
    security_type: asset?.security_type || 'Stocks',
    shares: asset?.shares || '',
    purchase_price: asset?.purchase_price || '',
    currency: asset?.currency || 'IDR',
    country: asset?.country || '',
    exchange: asset?.exchange || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      shares: Number(formData.shares),
      purchase_price: Number(formData.purchase_price),
    })
  }

  const securityTypes = [
    'Stocks',
    'ETFs',
    'Crypto',
    'Gold',
    'Bonds',
    'Private Investment',
  ]

  const currencies = ['IDR', 'USD', 'SGD', 'EUR', 'GBP', 'JPY']

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Ticker *"
          id="ticker"
          placeholder="e.g., BBCA.JK"
          value={formData.ticker}
          onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
          required
        />

        <Input
          label="Name"
          id="name"
          placeholder="e.g., Bank Central Asia Tbk"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <div className="md:col-span-2">
          <Select
            label="Security Type *"
            id="security_type"
            value={formData.security_type}
            onChange={(e) => setFormData({ ...formData, security_type: e.target.value as any })}
            options={securityTypes.map(type => ({ value: type, label: type }))}
          />
        </div>

        <Input
          label="Shares / Quantity *"
          id="shares"
          type="number"
          step="any"
          placeholder="e.g., 100"
          value={formData.shares}
          onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
          required
        />

        <Input
          label="Purchase Price *"
          id="purchase_price"
          type="number"
          step="any"
          placeholder="e.g., 9200"
          value={formData.purchase_price}
          onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
          required
        />

        <Select
          label="Currency"
          id="currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
          options={currencies.map(currency => ({ value: currency, label: currency }))}
        />

        <Input
          label="Country"
          id="country"
          placeholder="e.g., Indonesia"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        />

        <Input
          label="Exchange"
          id="exchange"
          placeholder="e.g., IDX"
          value={formData.exchange}
          onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {asset ? 'Update Asset' : 'Create Asset'}
        </Button>
      </div>
    </form>
  )
}
