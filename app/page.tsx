'use client'

import { useDashboardSummary, useAllocation, usePerformance, useDailyAnalysis } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading'
import { AllocationPieChart } from '@/components/charts/pie-chart'
import { PerformanceLineChart } from '@/components/charts/line-chart'
import { formatIDR, formatPercentage, formatLargeNumber } from '@/lib/utils/formatting'
import { useCustomAnalysis } from '@/hooks/use-ai'

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: allocation, isLoading: allocationLoading } = useAllocation()
  const { data: performance, isLoading: performanceLoading } = usePerformance('all')
  const { data: aiAnalysis, isLoading: aiLoading } = useDailyAnalysis()

  const customAnalysis = useCustomAnalysis()

  const handleRefreshAnalysis = async () => {
    await customAnalysis.mutateAsync({
      question: 'Provide a daily portfolio summary',
    })
  }

  if (summaryLoading || allocationLoading || performanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Portfolio & Net Worth Tracker
        </h1>
        <p className="text-gray-600 mt-1">
          Track your financial journey to {formatIDR(Number(process.env.GOAL_AMOUNT) || 15000000000)}
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Net Worth and Goal Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Worth Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">Total Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatIDR(summary.net_worth)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    As of {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Daily Change */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Daily Change:</span>
                  <span
                    className={`text-sm font-medium ${
                      summary.daily_change >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {summary.daily_change >= 0 ? '+' : ''}
                    {formatIDR(summary.daily_change)} (
                    {formatPercentage(summary.daily_change_percentage)}
                  )
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goal Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-gray-600">Progress to Goal</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {summary.goal_progress.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500 ease-out"
                      style={{ width: `${summary.goal_progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatLargeNumber(summary.net_worth)}</span>
                    <span>15B IDR</span>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Target: <span className="font-semibold">{formatIDR(15000000000)}</span>
                  </p>
                  <p className="mt-1">
                    Remaining:{' '}
                    <span className="font-semibold">
                      {formatIDR(15000000000 - summary.net_worth)}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-700">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {formatIDR(summary.total_assets)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {formatPercentage(summary.total_return_percentage)} overall return
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-700">Total Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {formatIDR(summary.total_cash)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Across all cash accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-700">Total Gain/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-2xl font-bold ${
                  summary.total_gain_loss >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {summary.total_gain_loss >= 0 ? '+' : ''}
                {formatIDR(summary.total_gain_loss)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Unrealized gains/losses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocation Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Asset Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allocationLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : allocation && allocation.chart_data.length > 0 ? (
                <AllocationPieChart data={allocation.chart_data} height={400} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No allocation data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {performanceLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : performance && performance.chart_data.length > 0 ? (
                <PerformanceLineChart data={performance.chart_data} height={400} />
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.top_performers && summary.top_performers.length > 0 ? (
              <div className="space-y-3">
                {summary.top_performers.map((performer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {performer.ticker}
                      </p>
                      <p className="text-sm text-gray-600">
                        {performer.name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          performer.return_percentage >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(performer.return_percentage)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No performance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Daily Analysis */}
        {aiAnalysis && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-700">
                  Daily AI Analysis
                </CardTitle>
                <button
                  onClick={handleRefreshAnalysis}
                  disabled={aiLoading || customAnalysis.isPending}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                >
                  {aiLoading || customAnalysis.isPending
                    ? 'Refreshing...'
                    : 'Refresh'}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {aiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <div className="whitespace-pre-wrap">{aiAnalysis.analysis}</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
