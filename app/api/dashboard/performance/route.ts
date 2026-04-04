import { NextRequest, NextResponse } from 'next/server'
import { getSnapshots } from '@/lib/supabase/client'
import { calculatePeriodPerformance } from '@/lib/utils/calculations'
import type { Snapshot } from '@/types'

/**
 * GET /api/dashboard/performance
 * Get performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // '1d', '7d', '30d', 'ytd', 'all'

    const today = new Date()
    let startDate: Date | null = null

    // Determine start date based on period
    switch (period) {
      case '1d':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 1)
        break
      case '7d':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        break
      case '30d':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 30)
        break
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      case 'all':
      default:
        startDate = null
        break
    }

    // Get snapshots
    const snapshots = (await getSnapshots()) as Snapshot[]
    const startDateStr = startDate?.toISOString() || ''
    const todayStr = today.toISOString()

    // Build date range array for API call
    let dateRange: string[] = []
    if (startDateStr) {
      dateRange = [startDateStr.split('T')[0], todayStr.split('T')[0]]
    } else {
      dateRange = [todayStr.split('T')[0]]
    }


    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json({
        period,
        metrics: null,
        chart_data: [],
      })
    }

    // Calculate performance metrics
    const startSnapshot = snapshots[0]
    const endSnapshot = snapshots[snapshots.length - 1]
    const periodDays = snapshots.length

    const metrics = calculatePeriodPerformance(
      startSnapshot.total_net_worth,
      endSnapshot.total_net_worth,
      periodDays
    )

    // Build chart data
    const chartData = snapshots.map(snapshot => ({
      date: snapshot.date,
      value: snapshot.total_net_worth,
    }))

    return NextResponse.json({
      period,
      metrics: {
        start_value: startSnapshot.total_net_worth,
        end_value: endSnapshot.total_net_worth,
        change: metrics.change,
        change_percentage: metrics.changePercentage,
        annualized_return: metrics.annualizedReturn,
        period_days: periodDays,
      },
      chart_data: chartData,
    })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    )
  }
}
