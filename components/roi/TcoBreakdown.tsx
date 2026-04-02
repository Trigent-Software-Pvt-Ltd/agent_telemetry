'use client'

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import {
  getTcoBreakdown, getWasteRatio, getAgentOversightEfficiency, getTokenCostTable,
} from '@/lib/mock-data'

export default function TcoBreakdown() {
  const breakdown = getTcoBreakdown()
  const waste = getWasteRatio()
  const oversight = getAgentOversightEfficiency()
  const tokenTable = getTokenCostTable()

  const totalWeekly = breakdown.reduce((a, b) => a + b.value, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* TCO Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
          >
            Total Cost of Ownership — Weekly
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            Combined weekly agent operating costs: <span className="font-bold">${totalWeekly.toLocaleString()}/wk</span>
          </p>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`$${value}/wk`, name]}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(value: string) => {
                    const item = breakdown.find(b => b.name === value)
                    return `${value} (${item?.pct}%)`
                  }}
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
            Assumption: Setup &amp; training amortized at ~10% of ongoing costs. Oversight labor at $55/hr blended rate.
          </div>
        </div>

        {/* Waste Ratio + Oversight Efficiency */}
        <div className="flex flex-col gap-5">
          {/* Waste ratio card */}
          <div
            className="card"
            style={{
              background: 'var(--status-red-bg)',
              border: '1px solid var(--status-red)',
            }}
          >
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              Waste Ratio
            </div>
            <div
              className="text-xl font-bold"
              style={{ color: 'var(--status-red)', fontFamily: 'var(--font-sora)' }}
            >
              {waste.pct}% of inference spend goes to failed runs
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              ${waste.amount.toFixed(2)}/week wasted on runs that did not complete successfully.
            </div>
            <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
              Assumption: Failed runs consume full token budget before failing. Partial failures not tracked separately.
            </div>
          </div>

          {/* Oversight efficiency */}
          <div className="card">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
            >
              Per-Agent Oversight Efficiency
            </h3>
            <div className="flex flex-col gap-2">
              {oversight.map(o => {
                const isExpensive = o.oversightHoursPerWeek >= 5
                return (
                  <div
                    key={o.agentId}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-xs"
                    style={{
                      background: isExpensive ? 'var(--status-red-bg)' : 'var(--status-green-bg)',
                      border: `1px solid ${isExpensive ? 'rgba(226,75,74,0.15)' : 'rgba(29,158,117,0.15)'}`,
                    }}
                  >
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {o.agentName.replace(' Agent', '')}
                      </span>
                      <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                        ({o.sigmaScore.toFixed(1)}σ)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {o.oversightHoursPerWeek}hrs/wk
                      </span>
                      <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
                        ${o.costPerWeek}/wk
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 text-xs p-3 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Insight:</span>{' '}
              Recommendation Writer (2.9σ) needs 6hrs/wk oversight — 3x more expensive to supervise than Odds Analysis (4.2σ) at 2hrs/wk.
            </div>
            <div className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
              Assumption: Oversight hours estimated from sigma score. Below 3.0σ = 8hrs, 3.0-3.5σ = 6hrs, 3.5-4.0σ = 3.5hrs, above 4.0σ = 2hrs. Rate: $55/hr.
            </div>
          </div>
        </div>
      </div>

      {/* Token cost table */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Token Cost Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: 'var(--text-primary)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Agent</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Avg Tokens/Run</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Cost/Token</th>
                <th className="text-right py-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Cost/Run</th>
              </tr>
            </thead>
            <tbody>
              {tokenTable.map(row => (
                <tr key={row.agentId} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2.5 font-medium">{row.agentName}</td>
                  <td className="py-2.5 text-right tabular-nums">{row.avgTokensPerRun.toLocaleString()}</td>
                  <td className="py-2.5 text-right tabular-nums font-mono text-[11px]">${row.costPerToken.toFixed(8)}</td>
                  <td className="py-2.5 text-right tabular-nums font-bold">${row.costPerRun.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>
          Assumption: Token counts estimated from model type (mini ~1,200, sonnet ~1,800, full ~2,400 tokens/run average).
        </div>
      </div>
    </div>
  )
}
