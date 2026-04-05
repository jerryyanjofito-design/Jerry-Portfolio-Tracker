'use client'

import { useDashboardSummary, useAllocation, usePerformance } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AllocationPieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'
import { LoadingSpinner } from '@/components/ui/loading'

export default function DashboardPage() {
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: summaryRefetch
  } = useDashboardSummary()

  const {
    data: allocationData,
    isLoading: allocationLoading,
    error: allocationError
  } = useAllocation('category')

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError
  } = usePerformance('all')

  // Handle any errors
  const isLoading = summaryLoading || allocationLoading || performanceLoading
  const error = summaryError || allocationError || performanceError

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio Tracker</h1>
          <p className="text-red-600">Unable to load dashboard data. Please try again later.</p>
          <p className="text-sm text-gray-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show dashboard content when data is loaded
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Total Net Worth: {summaryData?.total_net_worth ? `IDR ${summaryData.total_net_worth.toLocaleString()}` : 'Loading...'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
            <p className="text-red-600 font-semibold">Dashboard Error</p>
            <p className="text-sm text-red-700">{String(error)}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryData ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Assets</span>
                    <span className="text-2xl font-bold text-gray-900">
                      IDR {summaryData.total_assets_value?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Cash</span>
                    <span className="text-2xl font-bold text-gray-900">
                      IDR {summaryData.total_cash_value?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Net Worth</span>
                    <span className="text-3xl font-bold text-blue-600">
                      IDR {summaryData.total_net_worth?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              ) : (
                <LoadingSpinner size="md" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              {allocationData ? (
                <AllocationPieChart data={allocationData} height={300} />
              ) : (
                <LoadingSpinner size="md" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {performanceData ? (
                <LineChart data={performanceData} height={300} />
              ) : (
                <LoadingSpinner size="md" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => summaryRefetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>
        </div>
      </div>
    </div>
  )
}
