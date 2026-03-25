'use client'

import { useState } from 'react'
import { Run } from '@/types/telemetry'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip as RTooltip } from 'recharts'

interface LatencyChartProps {
  runs: Run[]
  sla_ms: number
  p50: number
  p90: number
  p95: number
}

type Percentile = 'P50' | 'P90' | 'P99'

export function LatencyChart({ runs, sla_ms, p50, p90, p95 }: LatencyChartProps) {
  const [activeTab, setActiveTab] = useState<Percentile>('P90')
  const tabs: Percentile[] = ['P50', 'P90', 'P99']

  const avgLabel = { P50: p50, P90: p90, P99: p95 }

  const data = [...runs].reverse().map((r, i) => ({
    index: i + 1,
    duration: r.duration_ms,
    run_id: r.run_id,
    cost: r.total_cost,
    outcome: r.outcome,
    model: r.model,
  }))

  return (
    <div className="card flex-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          Latency Distribution
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#F7F9FC] rounded-lg p-0.5">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer"
                style={{
                  background: activeTab === tab ? '#FFFFFF' : 'transparent',
                  color: activeTab === tab ? '#0A1628' : '#64748B',
                  boxShadow: activeTab === tab ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  borderBottom: activeTab === tab ? '2px solid #D4AF37' : '2px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: '#64748B' }}>
            Average: <span className="font-bold font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>{avgLabel[activeTab]}ms</span>
          </span>
        </div>
      </div>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="index" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} unit="ms" />
            <RTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white rounded-lg p-3 text-xs border" style={{ borderColor: '#E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div className="font-bold font-[var(--font-mono-jb)]">{d.run_id}</div>
                    <div>Duration: <span className="font-semibold">{d.duration}ms</span> {d.duration <= sla_ms ? <span style={{color:'#059669'}}>✓ below SLA</span> : <span style={{color:'#DC2626'}}>✗ above SLA</span>}</div>
                    <div>Cost: <span className="font-[var(--font-mono-jb)]">${d.cost.toFixed(6)}</span></div>
                    <div>Outcome: {d.outcome ? <span style={{color:'#059669'}}>Success</span> : <span style={{color:'#DC2626'}}>Failed</span>}</div>
                    <div>Model: {d.model}</div>
                  </div>
                )
              }}
            />
            <ReferenceLine y={sla_ms} stroke="#DC2626" strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `SLA ${sla_ms}ms`, position: 'right', fontSize: 10, fill: '#DC2626' }} />
            <Area
              type="monotone"
              dataKey="duration"
              stroke="#0891B2"
              strokeWidth={2}
              fill="#0891B2"
              fillOpacity={0.15}
              isAnimationActive={true}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
