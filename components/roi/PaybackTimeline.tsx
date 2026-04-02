'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { AGENT_SETUP_COSTS } from '@/lib/mock-data'

export function PaybackTimeline() {
  const data = AGENT_SETUP_COSTS
    .filter((a) => a.weeksToPayback !== Infinity)
    .sort((a, b) => a.weeksToPayback - b.weeksToPayback)
    .map((a) => ({
      name: a.agentName.replace(' Agent', ''),
      weeks: a.weeksToPayback,
      setup: a.setupCost,
      weeklyNet: a.weeklyNetRoi,
      fill: a.weeksToPayback <= 4 ? '#1D9E75' : a.weeksToPayback <= 8 ? '#BA7517' : '#E24B4A',
    }))

  const unprofitable = AGENT_SETUP_COSTS.filter((a) => a.weeksToPayback === Infinity)

  return (
    <div className="flex flex-col gap-5">
      {/* CEO summary */}
      <div
        className="card"
        style={{
          background: 'var(--status-green-bg)',
          border: '1px solid var(--status-green)',
        }}
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Payback Summary
        </div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
          {data.map((d, i) => (
            <span key={d.name}>
              <strong>{d.name}</strong>: {d.weeks} weeks
              {i < data.length - 1 ? ' · ' : ''}
            </span>
          ))}
          {unprofitable.length > 0 && (
            <span style={{ color: 'var(--status-red)' }}>
              {' · '}{unprofitable.map((u) => u.agentName.replace(' Agent', '')).join(', ')}: not yet profitable
            </span>
          )}
        </div>
      </div>

      {/* Assumptions */}
      <div
        className="rounded-lg px-4 py-3"
        style={{ background: 'rgba(186, 117, 23, 0.06)', border: '1px solid rgba(186, 117, 23, 0.2)' }}
      >
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1"
          style={{ color: '#BA7517' }}
        >
          Assumptions
        </div>
        <ul className="text-[11px] list-disc pl-4 flex flex-col gap-0.5" style={{ color: 'var(--text-secondary)' }}>
          <li>Setup cost includes prompt engineering, testing, deployment, and initial oversight ramp-up</li>
          <li>Complex agents (red status) cost ~2x to set up; amber agents ~1.4x</li>
          <li>Payback = Setup cost / Weekly net ROI</li>
          <li>Weekly net ROI derived from current task coverage, inference, oversight, and governance costs</li>
        </ul>
      </div>

      {/* Per-agent detail cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {AGENT_SETUP_COSTS.map((agent) => {
          const profitable = agent.weeksToPayback !== Infinity
          return (
            <div key={agent.agentId} className="card flex flex-col gap-2">
              <div
                className="text-xs font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {agent.agentName}
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Setup cost</div>
                  <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ${agent.setupCost.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Weekly net</div>
                  <div
                    className="font-semibold"
                    style={{ color: agent.weeklyNetRoi >= 0 ? 'var(--status-green)' : 'var(--status-red)' }}
                  >
                    ${agent.weeklyNetRoi.toLocaleString()}/wk
                  </div>
                </div>
              </div>
              <div
                className="text-lg font-bold tabular-nums text-center rounded-lg py-2 mt-auto"
                style={{
                  fontFamily: 'var(--font-sora)',
                  color: profitable
                    ? agent.weeksToPayback <= 4
                      ? '#1D9E75'
                      : agent.weeksToPayback <= 8
                      ? '#BA7517'
                      : '#E24B4A'
                    : 'var(--status-red)',
                  background: profitable
                    ? agent.weeksToPayback <= 4
                      ? 'var(--status-green-bg)'
                      : agent.weeksToPayback <= 8
                      ? 'rgba(186, 117, 23, 0.08)'
                      : 'var(--status-red-bg)'
                    : 'var(--status-red-bg)',
                }}
              >
                {profitable ? `${agent.weeksToPayback} weeks` : 'Not profitable'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Horizontal bar chart */}
      <div className="card">
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Weeks to Break Even
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 60)}>
          <BarChart data={data} layout="vertical" barSize={28} margin={{ left: 20, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}w`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'var(--text-primary)' }}
              axisLine={false}
              tickLine={false}
              width={160}
            />
            <Tooltip
              formatter={(val) => [
                `${val} weeks`,
                'Payback',
              ]}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                fontSize: 12,
              }}
            />
            <ReferenceLine x={4} stroke="#1D9E75" strokeDasharray="4 4" label={{ value: '4wk target', fontSize: 10, fill: '#1D9E75' }} />
            <Bar dataKey="weeks" radius={[0, 4, 4, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
              <LabelList
                dataKey="weeks"
                position="right"
                formatter={(v: unknown) => `${v}wk`}
                style={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-primary)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
