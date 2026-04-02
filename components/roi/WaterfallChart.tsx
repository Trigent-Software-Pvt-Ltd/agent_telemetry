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
} from 'recharts'
import type { RoiSnapshot } from '@/types/telemetry'
import { PROCESSES } from '@/lib/mock-data'

interface Props {
  snapshots: RoiSnapshot[]
  manualCost: number
}

function buildWaterfallData(snapshot: RoiSnapshot, manualCost: number) {
  const ratio = manualCost / snapshot.manualCostPerTask
  const gross = Math.round(snapshot.grossSavingWeekly * ratio)
  const oversight = snapshot.oversightCostWeekly
  const inference = snapshot.inferenceCostWeekly
  const governance = snapshot.governanceOverheadWeekly
  const net = gross - oversight - inference - governance

  return [
    { name: 'Gross saving',  value: gross,       fill: '#1D9E75', invisible: 0 },
    { name: 'Oversight',     value: -oversight,   fill: '#E87461', invisible: gross - oversight },
    { name: 'Inference',     value: -inference,   fill: '#E87461', invisible: gross - oversight - inference },
    { name: 'Governance',    value: -governance,  fill: '#E87461', invisible: gross - oversight - inference - governance },
    { name: 'Net ROI',       value: net,          fill: '#378ADD', invisible: 0 },
  ]
}

export function WaterfallChart({ snapshots, manualCost }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {snapshots.map((snapshot) => {
        const process = PROCESSES.find((p) => p.id === snapshot.processId)
        const data = buildWaterfallData(snapshot, manualCost)

        return (
          <div key={snapshot.processId} className="card">
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              {process?.name ?? snapshot.processId}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  formatter={(val) => [`$${Math.abs(Number(val ?? 0))}`, '']}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: 12,
                  }}
                />
                {/* Invisible base bar for waterfall effect */}
                <Bar dataKey="invisible" stackId="stack" fill="transparent" />
                <Bar dataKey="value" stackId="stack" radius={[4, 4, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(v: unknown) => {
                      const n = Number(v)
                      return n >= 0 ? `$${n.toLocaleString()}` : `-$${Math.abs(n).toLocaleString()}`
                    }}
                    style={{ fontSize: 11, fontWeight: 600, fill: 'var(--text-primary)' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}
