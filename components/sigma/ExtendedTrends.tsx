'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Agent, SigmaTrendPoint } from '@/types/telemetry'
import type { TimeRange, LatencyTrendPoint } from '@/lib/mock-data'
import { DpmoTrendChart } from './DpmoTrendChart'

const STATUS_COLORS: Record<string, string> = {
  green: '#1D9E75',
  amber: '#BA7517',
  red: '#E24B4A',
}

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '6m', label: '6 months' },
]

interface ExtendedTrendsProps {
  agents: Agent[]
  getTrends: (range: TimeRange) => Record<string, SigmaTrendPoint[]>
  getLatencyTrends: (range: TimeRange) => Record<string, LatencyTrendPoint[]>
}

interface MergedLatencyPoint {
  date: string
  [key: string]: number | string
}

function LatencyTooltip({
  active,
  payload,
  label,
  agentMap,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; color: string }>
  label?: string
  agentMap: Record<string, Agent>
}) {
  if (!active || !payload || !label) return null

  return (
    <div
      className="rounded-lg p-3 text-xs"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8E6E0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <p className="font-medium mb-2" style={{ color: '#6B7280' }}>
        {label}
      </p>
      {payload.map((entry) => {
        const agentId = (entry.dataKey as string).replace('_p95', '')
        const agent = agentMap[agentId]
        if (!agent) return null
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: '#374151' }}>
              {agent.name.replace(' Agent', '')}:
            </span>
            <span className="font-semibold tabular-nums" style={{ color: '#111827' }}>
              {Math.round(entry.value).toLocaleString()} ms
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ExtendedTrends({ agents, getTrends, getLatencyTrends }: ExtendedTrendsProps) {
  const [range, setRange] = useState<TimeRange>('30d')

  const trends = useMemo(() => getTrends(range), [getTrends, range])
  const latencyTrends = useMemo(() => getLatencyTrends(range), [getLatencyTrends, range])

  const agentMap: Record<string, Agent> = {}
  for (const a of agents) {
    agentMap[a.id] = a
  }

  // Merge latency data
  const latencyData = useMemo(() => {
    const dateMap = new Map<string, MergedLatencyPoint>()
    for (const agent of agents) {
      const points = latencyTrends[agent.id] ?? []
      for (const pt of points) {
        if (!dateMap.has(pt.date)) {
          dateMap.set(pt.date, { date: pt.date })
        }
        const row = dateMap.get(pt.date)!
        row[`${agent.id}_p95`] = pt.p95Ms
      }
    }
    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [agents, latencyTrends])

  // Compute tick interval based on range
  const tickInterval = range === '30d' ? 4 : range === '90d' ? 12 : 25

  return (
    <div className="space-y-4">
      {/* Time range selector */}
      <div
        className="inline-flex rounded-lg p-1"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setRange(opt.value)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
            style={{
              background: range === opt.value ? '#FFFFFF' : 'transparent',
              color: range === opt.value ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: range === opt.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* DPMO Trend Chart */}
      <DpmoTrendChart agents={agents} trends={trends} rangeLabel={range} />

      {/* Latency Trend Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
              P95 Latency Trend
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              Per-agent P95 response time over the selected period
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={latencyData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickFormatter={(val: string) => {
                const d = new Date(val)
                return `${d.getDate()}/${d.getMonth() + 1}`
              }}
              interval={tickInterval}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              tickFormatter={(val: number) =>
                val >= 1000 ? `${(val / 1000).toFixed(1)}s` : `${val}ms`
              }
              domain={[0, 'auto']}
            />
            <RechartsTooltip
              content={<LatencyTooltip agentMap={agentMap} />}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
              formatter={(value: string) => {
                const agentId = value.replace('_p95', '')
                const agent = agentMap[agentId]
                return agent ? agent.name.replace(' Agent', '') : value
              }}
            />
            <ReferenceLine
              y={2000}
              stroke="#BA7517"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: 'SLA target (2s)',
                position: 'insideTopRight',
                fill: '#BA7517',
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            {agents.map((agent) => (
              <Line
                key={agent.id}
                type="monotone"
                dataKey={`${agent.id}_p95`}
                stroke={STATUS_COLORS[agent.status]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
