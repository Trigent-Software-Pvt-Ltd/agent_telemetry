'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TransformationStage } from '@/types/telemetry'

interface RoiProjectionChartProps {
  stages: TransformationStage[]
}

export function RoiProjectionChart({ stages }: RoiProjectionChartProps) {
  const data = stages.map((s) => ({
    name: s.name.split(' (')[0],
    roi: s.weeklyNetRoi,
  }))

  return (
    <div className="card animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
        Weekly Net ROI Projection
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--status-green)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--status-green)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tickFormatter={(v: number) => `$${v.toLocaleString()}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`$${Number(value).toLocaleString()}/week`, 'Net ROI']}
          />
          <Area
            type="monotone"
            dataKey="roi"
            stroke="var(--status-green)"
            strokeWidth={2}
            fill="url(#roiGradient)"
            dot={{
              r: 5,
              fill: 'var(--status-green)',
              stroke: '#FFFFFF',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 7,
              fill: 'var(--status-green)',
              stroke: '#FFFFFF',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
