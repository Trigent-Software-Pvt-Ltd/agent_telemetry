'use client'

import { useCountUp } from '@/hooks/useCountUp'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

interface StatTileProps {
  label: string
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  delta?: number // percentage change, positive = good for most metrics
  invertDelta?: boolean // true if lower is better (cost, latency)
  sparklineData?: { value: number }[]
  sparklineColor?: string
  format?: (val: string) => string
}

export function StatTile({
  label, value, decimals = 0, prefix = '', suffix = '',
  delta, invertDelta = false, sparklineData, sparklineColor = '#0891B2',
  format,
}: StatTileProps) {
  const animated = useCountUp(value, 600, decimals)
  const display = format ? format(animated) : `${prefix}${animated}${suffix}`

  const deltaPositive = delta !== undefined ? (invertDelta ? delta < 0 : delta > 0) : undefined
  const deltaColor = deltaPositive ? '#059669' : '#DC2626'
  const deltaIcon = delta !== undefined ? (delta > 0 ? '▲' : '▼') : ''

  return (
    <div className="card flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#64748B' }}>
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          {display}
        </span>
        {delta !== undefined && (
          <span className="text-xs font-semibold" style={{ color: deltaColor }}>
            {deltaIcon} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ width: '100%', height: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke={sparklineColor} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
