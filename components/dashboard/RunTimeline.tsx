'use client'

import { Run } from '@/types/telemetry'
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ReferenceLine } from 'recharts'

interface RunTimelineProps {
  runs: Run[]
  sla_ms: number
}

export function RunTimeline({ runs, sla_ms }: RunTimelineProps) {
  const recent = [...runs].slice(0, 20).reverse()
  const data = recent.map((r, i) => ({
    name: r.run_id.split('-')[1],
    duration: r.duration_ms,
    cost: parseFloat((r.total_cost * 1000).toFixed(3)), // show as millicents for visibility
    outcome: r.outcome,
    run_id: r.run_id,
  }))

  return (
    <div className="card flex-1">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
        Run Timeline
      </h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} unit="ms" axisLine={{ stroke: '#E2E8F0' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} />
            <RTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                return (
                  <div className="bg-white rounded-lg p-3 text-xs border" style={{ borderColor: '#E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div className="font-bold font-[var(--font-mono-jb)]">{d.run_id}</div>
                    <div>Duration: {d.duration}ms</div>
                    <div>Cost: ${(d.cost / 1000).toFixed(6)}</div>
                  </div>
                )
              }}
            />
            <ReferenceLine yAxisId="left" y={sla_ms} stroke="#DC2626" strokeDasharray="6 4" />
            <Bar yAxisId="left" dataKey="duration" fill="#0891B2" fillOpacity={0.7} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
            <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#D4AF37" strokeWidth={2} dot={false} isAnimationActive animationDuration={800} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
