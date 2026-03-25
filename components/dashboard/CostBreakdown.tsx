'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Cell } from 'recharts'

const COLORS = ['#0891B2', '#D4AF37', '#7C3AED', '#059669', '#DC2626']

interface CostBreakdownProps {
  agentCosts: { agent: string; avgCost: number }[]
}

export function CostBreakdown({ agentCosts }: CostBreakdownProps) {
  const data = agentCosts.map(ac => ({
    name: ac.agent.replace('Agent', ''),
    cost: ac.avgCost,
    fullName: ac.agent,
  }))

  return (
    <div className="card">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
        Cost per Agent
      </h3>
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={{ stroke: '#E2E8F0' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} width={120} axisLine={{ stroke: '#E2E8F0' }} />
            <RTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-white rounded-lg p-3 text-xs border" style={{ borderColor: '#E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <div className="font-semibold">{d.fullName}</div>
                    <div>Avg Cost: <span className="font-[var(--font-mono-jb)]">${d.cost.toFixed(6)}</span></div>
                  </div>
                )
              }}
            />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={600}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
