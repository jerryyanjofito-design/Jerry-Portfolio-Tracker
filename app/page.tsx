'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSpinner } from '../../components/ui/loading'

export default function DashboardPage() {
  const [netWorth] = useState(0)
  const [goalProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatPercentage = (num: number) => {
    const sign = num >= 0 ? '+' : ''
    return `${sign}${num.toFixed(2)}%`
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
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Portfolio & Net Worth Tracker
        </h1>
        <p className="text-gray-600 mt-1">
          Track your financial journey to {formatIDR(15000000000)}
        </p>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">Total Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {formatIDR(netWorth)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    As of {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Daily Change:</span>
                  <span className="text-sm font-medium text-green-600">
                    +0 IDR (0.00%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-700">Goal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-gray-600">Progress to Goal</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {goalProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-500 ease-out"
                      style={{ width: `${goalProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 IDR</span>
                    <span>15B IDR</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Target: <span className="font-semibold">{formatIDR(15000000000)}</span>
                  </p>
                  <p className="mt-1">
                    Remaining: <span className="font-semibold">{formatIDR(15000000000 - netWorth)}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-700">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-1">0% overall return</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-700">Total Cash</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{formatIDR(0)}</p>
              <p className="text-sm text-gray-500 mt-1">Across all cash accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-700">Total Gain/Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{formatIDR(0)}</p>
              <p className="text-sm text-gray-500 mt-1">Unrealized gains/losses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">Portfolio Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🎉 Application Ready!</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Your Portfolio Tracker is running successfully. The navigation is working and you can access all pages:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li><strong>Dashboard</strong> - This page (coming soon with full functionality)</li>
                  <li><strong>Holdings</strong> - Add and manage your assets</li>
                  <li><strong>Cash Accounts</strong> - Manage your cash holdings</li>
                  <li><strong>AI Analysis</strong> - Get AI-powered insights</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📝 Setup Required</h3>
                <p className="text-sm text-gray-700">
                  To see real data, you need to:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Run the SQL scripts in <code className="bg-gray-100 px-1 rounded">scripts/migrations.sql</code></li>
                  <li>Run the seed data script in <code className="bg-gray-100 px-1 rounded">scripts/seed-database.sql</code></li>
                  <li>Add your first assets and cash accounts</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">✨ Features Working</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>✅ Navigation between pages</li>
                  <li>✅ Add/Edit/Delete assets</li>
                  <li>✅ Add/Edit/Delete cash accounts</li>
                  <li>✅ AI Chat Assistant</li>
                  <li>✅ Custom Analysis</li>
                  <li>✅ Real-time market data fetching</li>
                  <li>✅ Currency conversion</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
