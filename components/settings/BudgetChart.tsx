'use client'

import { AgentBudget } from '@/lib/mock-data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface Props {
  budgets: AgentBudget[]
}

const AGENT_COLORS = ['#0891B2', '#D4AF37', '#7C3AED', '#059669']

export function BudgetChart({ budgets }: Props) {
  // Build chart data: one entry per month, with each agent's spend
  const months = ['Jan', 'Feb', 'Mar', 'Apr']
  const avgCap = budgets.reduce((s, b) => s + b.monthlyCap, 0) / budgets.length

  const chartData = months.map((month, mi) => {
    const entry: Record<string, string | number> = { month }
    budgets.forEach(b => {
      entry[b.agentName] = b.monthlyHistory[mi]?.spend ?? 0
    })
    return entry
  })

  return (
    <div className="card">
      <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
        Monthly Budget Utilization
      </h2>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#64748B' }}
            />
            <ReferenceLine
              y={avgCap}
              stroke="#DC2626"
              strokeDasharray="6 3"
              label={{ value: `Avg Cap $${avgCap.toLocaleString()}`, fill: '#DC2626', fontSize: 11, position: 'right' }}
            />
            {budgets.map((b, i) => (
              <Bar
                key={b.agentId}
                dataKey={b.agentName}
                fill={AGENT_COLORS[i % AGENT_COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
