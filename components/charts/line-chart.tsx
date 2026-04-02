'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { formatDateShort } from '../../lib/utils/formatting'

interface PerformanceLineChartProps {
  data: Array<{ date: string; value: number }>
  height?: number
  showReferenceLine?: boolean
  referenceValue?: number
}

export function PerformanceLineChart({
  data,
  height = 400,
  showReferenceLine = true,
  referenceValue,
}: PerformanceLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-gray-500">
        No performance data available
      </div>
    )
  }

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))
  const refValue = referenceValue ?? minValue

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => formatDateShort(date)}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
              style: 'currency',
              currency: 'IDR',
            }).format(value)
          }
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
          labelFormatter={(date) => formatDateShort(date)}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        {showReferenceLine && (
          <ReferenceLine
            y={refValue}
            stroke="#9CA3AF"
            strokeDasharray="3 3"
            label={{ value: 'Initial', position: 'right' }}
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
