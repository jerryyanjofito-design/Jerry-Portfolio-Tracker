'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

interface AllocationItem {
  category: string
  value: number
  percentage: number
  color: string
}

interface AllocationPieChartProps {
  data: AllocationItem[]
  height?: number
}

export function AllocationPieChart({
  data,
  height = 400,
}: AllocationPieChartProps) {
  if (!data || data.length === 0) {
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
          outerRadius={120}
          dataKey="value"
          labelLine={false}
          label={(entry: any) =>
            `${entry.category}: ${entry.percentage?.toFixed(1) || 0}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value: any) => {
            const numValue = typeof value === 'number' ? value : Number(value)
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(numValue)
          }}
        />

        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}