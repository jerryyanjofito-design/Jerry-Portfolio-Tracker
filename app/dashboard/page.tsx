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

  const isLoading = summaryLoading || allocationLoading || performanceLoading
  const error = summaryError || allocationError || performanceError

  return (
    <div className="p-6">

      {/* ✅ DEBUG */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <p className="font-bold text-yellow-800">DEBUG DATA</p>
        <pre className="text-xs overflow-auto bg-gray-100 p-4 rounded">
          {JSON.stringify({
            summaryData,
            allocationData,
            performanceData,
            isLoading,
            error
          }, null, 2)}
        </pre>
      </div>

      {/* ✅ LOADING */}
      {isLoading && (
        <div className="flex justify-center mb-6">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* ❌ ERROR (only show if exists) */}
      {error && (
        <div className="mb-6 text-center text-red-600">
          Error: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* ✅ MAIN CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* SUMMARY */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryData ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Assets</span>
                  <span>IDR {summaryData.total_assets_value?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cash</span>
                  <span>IDR {summaryData.total_cash_value?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Worth</span>
                  <span>IDR {summaryData.total_net_worth?.toLocaleString() || '0'}</span>
                </div>
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </CardContent>
        </Card>

        {/* ALLOCATION */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {allocationData ? (
              <AllocationPieChart data={allocationData} height={300} />
            ) : (
              <LoadingSpinner />
            )}
          </CardContent>
        </Card>

        {/* PERFORMANCE */}
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData ? (
              <LineChart data={performanceData} height={300} />
            ) : (
              <LoadingSpinner />
            )}
          </CardContent>
        </Card>

      </div>

      {/* REFRESH */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => summaryRefetch()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Refresh
        </button>
      </div>

    </div>
  )
}