'use client'

import {
  AreaChart, Area,
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'
import type { WorkforceProjection } from '@/types/telemetry'

interface WorkforcePlanChartsProps {
  projection: WorkforceProjection
}

export function WorkforcePlanCharts({ projection }: WorkforcePlanChartsProps) {
  const data = projection.months

  // Flatten skills into columns for stacked area
  const skillsData = data.map(m => {
    const out: Record<string, string | number> = { month: m.month }
    for (const s of m.skills) {
      out[s.name] = s.demand
    }
    return out
  })

  const costData = data.map(m => ({
    month: m.month,
    salary: m.salaryBurn,
    agent: m.agentCost,
    netSaving: m.netSaving,
  }))

  const SKILL_COLORS = ['#0891B2', '#D4AF37', '#7C3AED', '#059669']
  const skillNames = data[0]?.skills.map(s => s.name) ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Headcount projection */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-4 font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          Headcount Projection (FTE)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--vip-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--vip-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--vip-muted)' }} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid var(--vip-border)', borderRadius: 8, fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="headcount"
              stroke="#0891B2"
              fill="rgba(8,145,178,0.15)"
              strokeWidth={2}
              name="Headcount (FTE)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Skills demand curve */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-4 font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          Skills Demand Curve
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={skillsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--vip-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--vip-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--vip-muted)' }} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid var(--vip-border)', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {skillNames.map((name, i) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stackId="skills"
                stroke={SKILL_COLORS[i]}
                fill={SKILL_COLORS[i]}
                fillOpacity={0.25}
                strokeWidth={1.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 3. Cost projection */}
      <div className="card">
        <h3 className="text-sm font-semibold mb-4 font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          Cost Projection
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={costData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--vip-border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--vip-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--vip-muted)' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid var(--vip-border)', borderRadius: 8, fontSize: 12 }}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="salary" fill="#0891B2" name="Salary Cost" radius={[2, 2, 0, 0]} barSize={18} />
            <Bar dataKey="agent" fill="#D4AF37" name="Agent Cost" radius={[2, 2, 0, 0]} barSize={18} />
            <Line type="monotone" dataKey="netSaving" stroke="#059669" strokeWidth={2} name="Net Saving" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
