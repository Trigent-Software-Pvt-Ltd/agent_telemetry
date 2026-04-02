'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type { Agent } from '@/types/telemetry'

interface Props {
  agent: Agent
  sigmaTarget: number
}

export default function CostOfInaction({ agent, sigmaTarget }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  // Only show for agents below sigma target
  if (agent.sigmaScore >= sigmaTarget) return null

  const failureRate = 1 - agent.successRate
  // Estimate daily runs from total runs over 30 days
  const dailyRuns = agent.totalRuns / 30

  // Calculate 90-day projections
  const additionalFailedTasks = Math.round(failureRate * dailyRuns * 90)

  // Revenue at risk: each failed task has an estimated value based on process cost
  const estimatedValuePerSuccess = agent.avgCostPerRun * 200 // approximate value multiplier
  const revenueAtRisk = Math.round(additionalFailedTasks * estimatedValuePerSuccess * 100) / 100

  // Oversight cost increase: more human reviews needed for low-quality agents
  // Below target means ~30% more oversight per point below target
  const sigmaDelta = sigmaTarget - agent.sigmaScore
  const oversightMultiplier = 1 + sigmaDelta * 0.30
  const weeklyOversightBase = agent.avgCostPerRun * agent.totalRuns * 10 // base oversight cost
  const oversightCostIncrease = Math.round(weeklyOversightBase * oversightMultiplier * 13) // 13 weeks in 90 days

  // Compliance risk: audit entries without adequate quality
  const complianceRiskEntries = Math.round(additionalFailedTasks * 0.15) // 15% of failures need audit

  // Generate 90-day cumulative cost timeline (10-day intervals)
  const timelineData = Array.from({ length: 10 }, (_, i) => {
    const day = (i + 1) * 9
    const t = day / 90
    // Costs accelerate slightly over time (compounding oversight burden)
    const cumulativeFailedTasks = Math.round(failureRate * dailyRuns * day)
    const cumulativeRevRisk = cumulativeFailedTasks * estimatedValuePerSuccess
    const cumulativeOversight = (weeklyOversightBase * oversightMultiplier * day) / 7
    const totalCumulative = cumulativeRevRisk + cumulativeOversight

    return {
      day: `Day ${day}`,
      'Revenue at Risk': parseFloat(cumulativeRevRisk.toFixed(2)),
      'Oversight Cost': parseFloat(cumulativeOversight.toFixed(2)),
      Total: parseFloat(totalCumulative.toFixed(2)),
    }
  })

  const totalProjectedCost = revenueAtRisk + oversightCostIncrease

  return (
    <div
      className="card"
      style={{
        border: '1px solid',
        borderColor: agent.sigmaScore < 3.0 ? 'var(--v-red)' : 'var(--v-amber)',
        background: agent.sigmaScore < 3.0 ? 'var(--v-red-bg)' : 'var(--v-amber-bg)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle
            size={18}
            style={{ color: agent.sigmaScore < 3.0 ? 'var(--v-red)' : 'var(--v-amber)' }}
          />
          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                fontFamily: 'var(--font-sora)',
                color: agent.sigmaScore < 3.0 ? 'var(--v-red)' : 'var(--v-amber)',
              }}
            >
              Cost of Inaction — What happens if we don&apos;t fix this?
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--vip-muted)' }}>
              {agent.sigmaScore.toFixed(1)} below {sigmaTarget.toFixed(1)} target — projected 90-day impact:
              {' '}
              <span className="font-semibold" style={{ color: 'var(--v-red)' }}>
                ${totalProjectedCost.toFixed(0)}
              </span>
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="mt-5 animate-fade-up space-y-5">
          {/* Stat cards row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Additional Failed Tasks"
              value={additionalFailedTasks.toLocaleString()}
              sublabel="over 90 days"
              color="var(--v-red)"
            />
            <StatCard
              label="Revenue at Risk"
              value={`$${revenueAtRisk.toFixed(0)}`}
              sublabel="opportunity cost"
              color="var(--v-red)"
            />
            <StatCard
              label="Oversight Cost Increase"
              value={`$${oversightCostIncrease.toFixed(0)}`}
              sublabel="extra human reviews"
              color="var(--v-amber)"
            />
            <StatCard
              label="Compliance Risk"
              value={`${complianceRiskEntries} entries`}
              sublabel="unaudited failures"
              color="var(--v-amber)"
            />
          </div>

          {/* Escalating risk timeline */}
          <div>
            <h4
              className="text-xs font-semibold mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
            >
              Cumulative Cost Over 90 Days
            </h4>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={timelineData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riskGradientRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="riskGradientOvr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D97706" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: 'var(--vip-muted)' }}
                    axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--vip-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid var(--vip-border)',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(value, name) => [`$${Number(value).toFixed(2)}`, String(name)]}
                  />
                  <Area
                    type="monotone"
                    dataKey="Revenue at Risk"
                    stackId="1"
                    stroke="#DC2626"
                    strokeWidth={1.5}
                    fill="url(#riskGradientRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Oversight Cost"
                    stackId="1"
                    stroke="#D97706"
                    strokeWidth={1.5}
                    fill="url(#riskGradientOvr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sublabel,
  color,
}: {
  label: string
  value: string
  sublabel: string
  color: string
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--vip-muted)' }}>
        {label}
      </div>
      <div
        className="text-lg font-bold mt-1 tabular-nums"
        style={{ color, fontFamily: 'var(--font-sora)' }}
      >
        {value}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: 'var(--vip-muted)' }}>
        {sublabel}
      </div>
    </div>
  )
}
