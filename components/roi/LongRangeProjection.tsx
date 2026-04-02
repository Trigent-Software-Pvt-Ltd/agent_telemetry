'use client'

import { useState } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getLongRangeProjection } from '@/lib/mock-data'

export default function LongRangeProjection() {
  const data = getLongRangeProjection()
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)

  // Sample every 3 months for x-axis readability
  const tickIndices = [0, 6, 12, 18, 24, 30, 36]

  // Key milestones
  const milestones = [
    { month: 8, label: 'Break-even on all setup costs' },
    { month: 18, label: '60% automation coverage' },
    { month: 30, label: 'Peak ROI efficiency reached' },
  ]

  const finalModerate = data[data.length - 1].moderate

  return (
    <div className="flex flex-col gap-6">
      {/* Hero insight */}
      <div
        className="card animate-fade-up flex items-center gap-5"
        style={{
          background: 'var(--status-green-bg)',
          border: '1px solid var(--status-green)',
        }}
      >
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            3-Year Cumulative ROI (Moderate)
          </div>
          <div
            className="text-3xl font-bold tabular-nums"
            style={{ color: 'var(--status-green)', fontFamily: 'var(--font-sora)' }}
          >
            ${(finalModerate / 1000).toFixed(0)}K
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            At moderate pace, cumulative ROI reaches ${(finalModerate / 1000).toFixed(0)}K by end of Year 3.
            Conservative: ${(data[data.length - 1].conservative / 1000).toFixed(0)}K.
            Aggressive: ${(data[data.length - 1].aggressive / 1000).toFixed(0)}K.
          </div>
        </div>
      </div>

      {/* Cumulative ROI chart */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Cumulative ROI — 3 Scenarios
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
          36-month projection showing conservative, moderate, and aggressive growth scenarios.
        </p>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              onMouseMove={(e) => {
                const idx = e?.activeTooltipIndex
                if (typeof idx === 'number') setHoveredMonth(idx)
              }}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                ticks={tickIndices.map(i => data[i]?.label)}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="conservative"
                name="Conservative"
                stroke="#94A3B8"
                fill="#94A3B8"
                fillOpacity={0.1}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="moderate"
                name="Moderate"
                stroke="#378ADD"
                fill="#378ADD"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="aggressive"
                name="Aggressive"
                stroke="#1D9E75"
                fill="#1D9E75"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
          Assumption: Monthly ROI increments grow linearly. Conservative +$120/mo, moderate +$200/mo, aggressive +$320/mo compounding on base.
        </div>
      </div>

      {/* Headcount + Coverage chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
          >
            Headcount Trajectory
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  ticks={tickIndices.map(i => data[i]?.label)}
                />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                  formatter={(value) => [value, 'Headcount']}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="headcount"
                  stroke="#E87461"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
            Assumption: Headcount reduction at moderate pace (1.8%/mo decay, floor of 4 FTEs). Roles transition, not eliminated.
          </div>
        </div>

        <div className="card">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
          >
            Agent Coverage Growth
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  ticks={tickIndices.map(i => data[i]?.label)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                />
                <Tooltip
                  formatter={(value) => [`${Math.round(Number(value) * 100)}%`, 'Coverage']}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="agentCoveragePct"
                  stroke="#D4AF37"
                  fill="#D4AF37"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
            Assumption: Coverage grows ~1.4%/month, capped at 85%. Not all tasks are automatable.
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Key Milestones
        </h3>
        <div className="flex flex-col gap-3">
          {milestones.map(m => (
            <div
              key={m.month}
              className="flex items-center gap-4 py-2 px-3 rounded-lg"
              style={{
                background: hoveredMonth === m.month ? 'var(--status-green-bg)' : 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="text-sm font-bold tabular-nums min-w-[60px]"
                style={{ color: '#378ADD', fontFamily: 'var(--font-sora)' }}
              >
                Month {m.month}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
