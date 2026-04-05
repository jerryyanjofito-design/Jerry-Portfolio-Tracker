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

interface LineChartProps {
  data: Array<{ date: string; value: number }>
  height?: number
  showReferenceLine?: boolean
  referenceValue?: number
}

export function LineChart({
  data,
  height = 400,
  showReferenceLine = true,
  referenceValue,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-gray-500">
        No performance data available
      </div>
    )
  }

  const minValue = Math.min(...data.map((d) => d.value))
  const refValue = referenceValue ?? minValue

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
        />

        <YAxis
          tickFormatter={(value) =>
            new Intl.NumberFormat('id-ID', {
              notation: 'compact',
              compactDisplay: 'short',
              style: 'currency',
              currency: 'IDR',
            }).format(value as number)
          }
          tick={{ fontSize: 12 }}
        />

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
          />
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}