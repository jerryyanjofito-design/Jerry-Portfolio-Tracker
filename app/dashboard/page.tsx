'use client'

import { useDashboardSummary, useAllocation, usePerformance } from '@/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AllocationPieChart } from '@/components/charts/pie-chart'
import { LineChart } from '@/components/charts/line-chart'

// Premium Design Tokens

const TEXT_COLORS = {
  primary: '#1F2937',
  secondary: '#6B7280',
  muted: '#64748B',
} as const

const BORDER_COLORS = {
  DEFAULT: '#E5E7EB',
  elevated: '#F3F4F6',
} as const

const CARD_STYLES = {
  elevated: 'bg-white shadow-xl border border-gray-100 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1',
  standard: 'bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
  glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl',
}

const TYPOGRAPHY = {
  hero: 'text-4xl md:text-5xl font-bold text-gray-900 tracking-tight',
  h1: 'text-2xl md:text-3xl font-bold text-gray-900',
  h2: 'text-xl font-semibold text-gray-800',
  h3: 'text-lg font-semibold text-gray-700',
  body: 'text-base text-gray-600',
  small: 'text-sm text-gray-500',
  label: 'text-xs font-medium text-gray-400 uppercase tracking-wide',
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatPercentage = (value: number) => {
  const isPositive = value >= 0
  return `${isPositive ? '+' : ''}${value.toFixed(2)}%`
}

export default function DashboardPage() {
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useDashboardSummary()
  const { data: allocationData, isLoading: allocationLoading } = useAllocation('category')
  const { data: performanceData, isLoading: performanceLoading } = usePerformance('all')

  if (summaryLoading || allocationLoading || performanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={TYPOGRAPHY.body}>Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (summaryError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className={CARD_STYLES.elevated}>
          <CardContent className="p-8 text-center">
            <h2 className={TYPOGRAPHY.h1 + ' mb-2 text-red-600'}>Unable to Load Dashboard</h2>
            <p className={TYPOGRAPHY.body}>Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = summaryData?.data
  const allocation = allocationData?.data?.allocation || []
  const performance = performanceData?.data?.performance || []

  // Prepare allocation data for chart
  const chartData = allocation.map((item: any) => ({
    category: item.category,
    value: item.value,
    percentage: item.percentage,
    color: getChartColor(item.category),
  }))

  // Prepare performance data for chart
  const performanceChartData = performance.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    value: item.value,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0052D4] to-[#0066FF] text-white py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className={TYPOGRAPHY.hero.replace('text-gray-900', 'text-white')}>Portfolio Dashboard</h1>
          <p className="text-lg text-blue-100 mt-2">Track your wealth with precision and elegance</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Assets Card */}
          <Card className={CARD_STYLES.elevated}>
            <CardHeader>
              <CardTitle className={TYPOGRAPHY.label + ' mb-2'}>Total Assets</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(summary?.total_assets || 0)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className={TEXT_COLORS.secondary}>Total Value</span>
                <span className="font-semibold text-green-600">
                  {summary?.total_return_percentage ? formatPercentage(summary.total_return_percentage) : '+0.00%'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Cash Holdings Card */}
          <Card className={CARD_STYLES.elevated}>
            <CardHeader>
              <CardTitle className={TYPOGRAPHY.label + ' mb-2'}>Cash Holdings</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(summary?.total_cash || 0)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className={TEXT_COLORS.secondary}>Available Liquidity</span>
                <span className="font-semibold">
                  {summary?.total_cash && summary?.total_assets ? formatPercentage((summary.total_cash / summary.total_assets) * 100) : '0.00%'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Investment Portfolio Card */}
          <Card className={CARD_STYLES.elevated}>
            <CardHeader>
              <CardTitle className={TYPOGRAPHY.label + ' mb-2'}>Investment Portfolio</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency((summary?.total_assets || 0) - (summary?.total_cash || 0))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className={TEXT_COLORS.secondary}>Invested Value</span>
                <span className="font-semibold text-blue-600">
                  {summary?.total_assets && summary?.total_cash ? formatPercentage(((summary.total_assets - summary.total_cash) / summary.total_assets) * 100) : '0.00%'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Allocation */}
          <Card className={CARD_STYLES.glass}>
            <CardHeader>
              <CardTitle className={TYPOGRAPHY.h2}>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <AllocationPieChart data={chartData} height={400} />
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className={CARD_STYLES.glass}>
            <CardHeader>
              <CardTitle className={TYPOGRAPHY.h2}>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <LineChart data={performanceChartData} height={400} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <Card className={CARD_STYLES.standard}>
          <CardHeader>
            <CardTitle className={TYPOGRAPHY.h2}>Asset Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allocation.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getChartColor(item.category) }}
                    />
                    <div>
                      <div className={TYPOGRAPHY.h3}>{item.category}</div>
                      <div className={TYPOGRAPHY.small}>Asset Category</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={TYPOGRAPHY.body + ' font-semibold'}>
                      {formatCurrency(item.value)}
                    </div>
                    <div className={TYPOGRAPHY.small}>
                      {formatPercentage(item.percentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getChartColor(category: string): string {
  const colors: Record<string, string> = {
    'Stocks': '#3B82F6',
    'Bonds': '#10B981',
    'Real Estate': '#F59E0B',
    'Commodities': '#EF4444',
    'Cash': '#6B7280',
    'Cryptocurrency': '#8B5CF6',
    'Other': '#EC4899',
  }
  return colors[category] || '#6B7280'
}