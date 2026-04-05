'use client'

import { useDashboardSummary } from '@/hooks'

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardSummary()

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard Working ✅</h1>

      <pre>
        {JSON.stringify({ data, isLoading, error }, null, 2)}
      </pre>
    </div>
  )
}