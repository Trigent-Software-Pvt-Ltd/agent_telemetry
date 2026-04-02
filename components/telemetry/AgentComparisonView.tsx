'use client'

import { useState } from 'react'
import { AgentProfile } from '@/types/telemetry'
import { getAllAgents } from '@/lib/mock-data'
import { ChevronDown, Trophy } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend,
} from 'recharts'

export function AgentComparisonView() {
  const agents = getAllAgents()
  const [agentAId, setAgentAId] = useState(agents[0]?.id ?? '')
  const [agentBId, setAgentBId] = useState(agents[3]?.id ?? '')

  const agentA = agents.find(a => a.id === agentAId)
  const agentB = agents.find(a => a.id === agentBId)

  // Normalise metrics to 0-100 for radar
  function normalise(agent: AgentProfile) {
    const allLatencies = agents.map(a => a.p95Latency)
    const maxLatency = Math.max(...allLatencies)
    const allCosts = agents.map(a => a.avgCostPerRun)
    const maxCost = Math.max(...allCosts)

    return {
      quality: Math.min(100, (agent.sigmaScore / 6) * 100),
      reliability: agent.successRate * 100,
      speed: Math.max(0, (1 - agent.p95Latency / maxLatency) * 100),
      costEfficiency: Math.max(0, (1 - agent.avgCostPerRun / maxCost) * 100),
      volume: Math.min(100, (agent.totalRuns / 2500) * 100),
      consistency: agent.consistency,
    }
  }

  const dimensions = [
    { key: 'quality', label: 'Quality', description: 'Sigma score' },
    { key: 'reliability', label: 'Reliability', description: 'Success rate' },
    { key: 'speed', label: 'Speed', description: 'Inverse latency' },
    { key: 'costEfficiency', label: 'Cost Efficiency', description: 'Cost per run' },
    { key: 'volume', label: 'Volume', description: 'Total runs' },
    { key: 'consistency', label: 'Consistency', description: 'Run consistency' },
  ] as const

  const metricCards = [
    { label: 'Sigma Score', getValue: (a: AgentProfile) => a.sigmaScore.toFixed(1) + 'σ', getRaw: (a: AgentProfile) => a.sigmaScore, better: 'higher' as const },
    { label: 'DPMO', getValue: (a: AgentProfile) => a.dpmo.toLocaleString(), getRaw: (a: AgentProfile) => a.dpmo, better: 'lower' as const },
    { label: 'Success Rate', getValue: (a: AgentProfile) => Math.round(a.successRate * 100) + '%', getRaw: (a: AgentProfile) => a.successRate, better: 'higher' as const },
    { label: 'Avg Cost', getValue: (a: AgentProfile) => '$' + a.avgCostPerRun.toFixed(3), getRaw: (a: AgentProfile) => a.avgCostPerRun, better: 'lower' as const },
    { label: 'P95 Latency', getValue: (a: AgentProfile) => a.p95Latency + 'ms', getRaw: (a: AgentProfile) => a.p95Latency, better: 'lower' as const },
    { label: 'Total Runs', getValue: (a: AgentProfile) => a.totalRuns.toLocaleString(), getRaw: (a: AgentProfile) => a.totalRuns, better: 'higher' as const },
  ]

  let radarData: Array<Record<string, string | number>> = []
  let normA: ReturnType<typeof normalise> | null = null
  let normB: ReturnType<typeof normalise> | null = null
  let aWins = 0
  let bWins = 0

  if (agentA && agentB) {
    normA = normalise(agentA)
    normB = normalise(agentB)
    radarData = dimensions.map(d => ({
      dimension: d.label,
      [agentA.name]: normA![d.key],
      [agentB.name]: normB![d.key],
    }))

    // Count dimension wins
    for (const d of dimensions) {
      if (normA[d.key] > normB[d.key]) aWins++
      else if (normB[d.key] > normA[d.key]) bWins++
    }
  }

  return (
    <div className="space-y-6">
      {/* Agent selectors */}
      <div className="flex items-center gap-4">
        <AgentSelect
          label="Agent A"
          agents={agents}
          value={agentAId}
          onChange={setAgentAId}
          accentColor="#0891B2"
        />
        <div className="text-sm font-bold" style={{ color: '#94A3B8' }}>vs</div>
        <AgentSelect
          label="Agent B"
          agents={agents}
          value={agentBId}
          onChange={setAgentBId}
          accentColor="#7C3AED"
        />
      </div>

      {agentA && agentB && (
        <>
          {/* Winner callout */}
          <div
            className="card flex items-center gap-3"
            style={{ border: '1px solid #D4AF3740', background: '#FBF5DC30' }}
          >
            <Trophy size={20} style={{ color: '#D4AF37' }} />
            <span className="text-sm" style={{ color: '#0A1628' }}>
              <strong className="font-[var(--font-sora)]">
                {aWins > bWins ? agentA.name : bWins > aWins ? agentB.name : 'Tie'}
              </strong>
              {aWins !== bWins
                ? ` outperforms ${aWins > bWins ? agentB.name : agentA.name} in ${Math.max(aWins, bWins)} of 6 dimensions`
                : ' — both agents are evenly matched across all dimensions'}
            </span>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {metricCards.map(m => {
              const rawA = m.getRaw(agentA)
              const rawB = m.getRaw(agentB)
              const aIsBetter = m.better === 'higher' ? rawA > rawB : rawA < rawB
              const bIsBetter = m.better === 'higher' ? rawB > rawA : rawB < rawA
              return (
                <div key={m.label} className="card">
                  <div className="text-xs font-medium mb-3" style={{ color: '#64748B' }}>{m.label}</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs mb-1" style={{ color: '#0891B2' }}>{agentA.name.replace('Agent', '')}</div>
                      <div
                        className="text-lg font-bold tabular-nums font-[var(--font-sora)]"
                        style={{ color: aIsBetter ? '#059669' : bIsBetter ? '#DC2626' : '#0A1628' }}
                      >
                        {m.getValue(agentA)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs mb-1" style={{ color: '#7C3AED' }}>{agentB.name.replace('Agent', '')}</div>
                      <div
                        className="text-lg font-bold tabular-nums font-[var(--font-sora)]"
                        style={{ color: bIsBetter ? '#059669' : aIsBetter ? '#DC2626' : '#0A1628' }}
                      >
                        {m.getValue(agentB)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Radar chart */}
          <div className="card">
            <h3 className="text-sm font-bold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
              Performance Radar
            </h3>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#94A3B8', fontSize: 10 }}
                />
                <Radar
                  name={agentA.name}
                  dataKey={agentA.name}
                  stroke="#0891B2"
                  fill="#0891B2"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name={agentB.name}
                  dataKey={agentB.name}
                  stroke="#7C3AED"
                  fill="#7C3AED"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#64748B' }}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Per-dimension winners */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
              {dimensions.map(d => {
                const valA = normA![d.key]
                const valB = normB![d.key]
                const winner = valA > valB ? 'A' : valB > valA ? 'B' : 'tie'
                return (
                  <div
                    key={d.key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                    style={{ background: '#F7F9FC', border: '1px solid #E2E8F0' }}
                  >
                    <span style={{ color: '#64748B' }}>{d.label}</span>
                    <span
                      className="font-semibold"
                      style={{
                        color: winner === 'A' ? '#0891B2' : winner === 'B' ? '#7C3AED' : '#94A3B8',
                      }}
                    >
                      {winner === 'A' ? agentA.name.replace('Agent', '') : winner === 'B' ? agentB.name.replace('Agent', '') : 'Tie'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Agent Select dropdown ── */
function AgentSelect({
  label,
  agents,
  value,
  onChange,
  accentColor,
}: {
  label: string
  agents: AgentProfile[]
  value: string
  onChange: (id: string) => void
  accentColor: string
}) {
  return (
    <div className="flex-1">
      <label className="text-xs font-semibold uppercase mb-1.5 block" style={{ color: accentColor, letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border text-sm font-medium cursor-pointer"
          style={{ borderColor: '#E2E8F0', color: '#0A1628', background: '#FFFFFF' }}
        >
          {agents.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.processName})
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: '#94A3B8' }}
        />
      </div>
    </div>
  )
}
