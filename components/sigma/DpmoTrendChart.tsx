'use client'

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

const STATUS_COLORS: Record<string, string> = {
  green: '#1D9E75',
  amber: '#BA7517',
  red: '#E24B4A',
}

interface DpmoTrendChartProps {
  agents: Agent[]
  trends: Record<string, SigmaTrendPoint[]>
  rangeLabel?: string
}

interface MergedPoint {
  date: string
  [agentId: string]: number | string
}

function CustomTooltip({
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
        const agentId = (entry.dataKey as string).replace('_dpmo', '')
        const agent = agentMap[agentId]
        if (!agent) return null

        // Find sigma for this point
        const sigmaKey = `${agentId}_sigma`
        const payloadItem = payload.find(() => true) // we need to get from the merged data
        // We stored sigma alongside dpmo in the merged data, but Recharts only gives us the lines we plot
        // So we compute sigma from dpmo using an inverse approximation
        const dpmo = entry.value
        const sigmaApprox = dpmo > 0 ? ((Math.log(1_000_000 / dpmo) * 0.2985 / 0.8406) + 0.342 / 0.8406) : 6
        void sigmaKey
        void payloadItem

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
              {Math.round(dpmo).toLocaleString()} DPMO
            </span>
            <span className="tabular-nums" style={{ color: '#9CA3AF' }}>
              ({sigmaApprox.toFixed(1)}&sigma;)
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function DpmoTrendChart({ agents, trends, rangeLabel }: DpmoTrendChartProps) {
  // Merge all agent trend data into a single array keyed by date
  const dateMap = new Map<string, MergedPoint>()

  for (const agent of agents) {
    const points = trends[agent.id] ?? []
    for (const pt of points) {
      if (!dateMap.has(pt.date)) {
        dateMap.set(pt.date, { date: pt.date })
      }
      const row = dateMap.get(pt.date)!
      row[`${agent.id}_dpmo`] = pt.dpmo
      row[`${agent.id}_sigma`] = pt.sigma
    }
  }

  const data = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  const tickInterval = data.length > 100 ? 25 : data.length > 50 ? 12 : 4

  const agentMap: Record<string, Agent> = {}
  for (const a of agents) {
    agentMap[a.id] = a
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#111827' }}>
            {rangeLabel === '90d' ? '90-Day' : rangeLabel === '6m' ? '6-Month' : '30-Day'} DPMO Trend
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
            Lower DPMO is better. Target: 6,210 DPMO (4.0&sigma;)
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
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
              val >= 1000 ? `${Math.round(val / 1000)}k` : String(val)
            }
            domain={[0, 'auto']}
          />
          <RechartsTooltip
            content={<CustomTooltip agentMap={agentMap} />}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
            formatter={(value: string) => {
              const agentId = value.replace('_dpmo', '')
              const agent = agentMap[agentId]
              return agent ? agent.name.replace(' Agent', '') : value
            }}
          />

          {/* 4.0 sigma target line */}
          <ReferenceLine
            y={6210}
            stroke="#378ADD"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: '4.0\u03C3 target (6,210)',
              position: 'insideTopRight',
              fill: '#378ADD',
              fontSize: 10,
              fontWeight: 600,
            }}
          />

          {agents.map((agent) => (
            <Line
              key={agent.id}
              type="monotone"
              dataKey={`${agent.id}_dpmo`}
              stroke={STATUS_COLORS[agent.status]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: '#FFFFFF' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
