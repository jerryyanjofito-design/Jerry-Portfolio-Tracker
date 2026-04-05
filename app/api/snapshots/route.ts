import { NextRequest, NextResponse } from 'next/server'
import { getSnapshots } from '@/lib/supabase/client'
import { Snapshot } from '@/types'

/**
 * GET /api/snapshots
 * Get historical snapshots
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const snapshots = await getSnapshots(startDate || undefined, endDate || undefined)

    // Calculate trend
    let trend = { up: false, down: false }
    if (snapshots.length >= 2) {
      const first = snapshots[0] as Snapshot
      const last = snapshots[snapshots.length - 1] as Snapshot
      trend.up = last.total_net_worth > first.total_net_worth
      trend.down = last.total_net_worth < first.total_net_worth
    }

    return NextResponse.json({
      snapshots,
      count: snapshots.length,
      trend,
    })
  } catch (error) {
    console.error('Error fetching snapshots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    )
  }
}
