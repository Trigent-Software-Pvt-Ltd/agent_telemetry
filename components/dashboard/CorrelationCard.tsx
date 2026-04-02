'use client'

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Correlation } from '@/types/telemetry'

const STRENGTH_COLORS: Record<string, { color: string; bg: string }> = {
  Strong:   { color: '#059669', bg: '#ECFDF5' },
  Moderate: { color: '#D97706', bg: '#FFFBEB' },
  Weak:     { color: '#94A3B8', bg: '#F1F5F9' },
}

export function CorrelationCard({ correlation }: { correlation: Correlation }) {
  const strengthCfg = STRENGTH_COLORS[correlation.strength] ?? STRENGTH_COLORS.Weak

  // Simple linear regression for trend line
  const xs = correlation.data.map(d => d.x)
  const ys = correlation.data.map(d => d.y)
  const n = xs.length
  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0)
  const sumX2 = xs.reduce((a, x) => a + x * x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)

  const trendData = [
    { x: minX, y: parseFloat((slope * minX + intercept).toFixed(2)) },
    { x: maxX, y: parseFloat((slope * maxX + intercept).toFixed(2)) },
  ]

  return (
    <div className="card animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold font-[var(--font-sora)] mb-1" style={{ color: '#0A1628' }}>
            {correlation.title}
          </h4>
          <div className="flex items-center gap-2">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
              style={{ background: strengthCfg.bg, color: strengthCfg.color, letterSpacing: '0.05em' }}
            >
              {correlation.strength}
            </span>
            <span className="text-xs font-[var(--font-mono-jb)] tabular-nums" style={{ color: '#64748B' }}>
              r = {correlation.coefficient > 0 ? '+' : ''}{correlation.coefficient.toFixed(2)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#64748B' }}>
              {correlation.type}
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" dataKey="x" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <YAxis type="number" dataKey="y" tick={{ fontSize: 10, fill: '#94A3B8' }} />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 11 }}
            />
            <Scatter data={correlation.data} fill="#D4AF37" fillOpacity={0.7} r={5} />
            {/* Trend line as reference */}
            <ReferenceLine
              segment={[
                { x: trendData[0].x, y: trendData[0].y },
                { x: trendData[1].x, y: trendData[1].y },
              ]}
              stroke={strengthCfg.color}
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 p-3 rounded-lg" style={{ background: '#F7F9FC' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
          <span className="font-semibold" style={{ color: '#0A1628' }}>Insight: </span>
          {correlation.insight}
        </p>
      </div>
    </div>
  )
}
