'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { AssetAllocationItem } from '../../lib/supabase/types'

interface AllocationPieChartProps {
  data: AssetAllocationItem[]
  height?: number
}

export function AllocationPieChart({ data, height = 400 }: AllocationPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-gray-500">
        No allocation data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percentage }) =>
            `${category}: ${percentage.toFixed(1)}%`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value),
            'Value',
          ]}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
