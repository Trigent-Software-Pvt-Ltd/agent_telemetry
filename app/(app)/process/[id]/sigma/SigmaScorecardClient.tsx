'use client'

import { useCallback } from 'react'
import { AgentSigmaCard } from '@/components/sigma/AgentSigmaCard'
import { SigmaLegend } from '@/components/sigma/SigmaLegend'
import { ExtendedTrends } from '@/components/sigma/ExtendedTrends'
import { ImprovementTracker } from '@/components/sigma/ImprovementTracker'
import type { Process, Agent, SigmaTrendPoint } from '@/types/telemetry'
import type { SigmaHistoryEntry, TimeRange } from '@/lib/mock-data'
import { getSigmaTrendsForRange, getLatencyTrendsForRange } from '@/lib/mock-data'

interface SigmaScorecardClientProps {
  process: Process
  agents: Agent[]
  trends: Record<string, SigmaTrendPoint[]>
  sigmaTarget: number
  sigmaHistory: SigmaHistoryEntry[]
}

export function SigmaScorecardClient({ process, agents, trends, sigmaTarget, sigmaHistory }: SigmaScorecardClientProps) {
  const getTrends = useCallback((range: TimeRange) => {
    if (range === '30d') return trends
    const result: Record<string, SigmaTrendPoint[]> = {}
    for (const agent of agents) {
      result[agent.id] = getSigmaTrendsForRange(agent.id, range)
    }
    return result
  }, [agents, trends])

  const getLatencyTrends = useCallback((range: TimeRange) => {
    const result: Record<string, ReturnType<typeof getLatencyTrendsForRange>> = {}
    for (const agent of agents) {
      result[agent.id] = getLatencyTrendsForRange(agent.id, range)
    }
    return result
  }, [agents])

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#111827' }}>
          Sigma Scorecard &mdash; {process.name}
        </h1>
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
          Your quality target: {sigmaTarget.toFixed(1)}&sigma; (6,210 DPMO) &middot; Set in organisation settings
        </p>
      </div>

      {/* Agent cards row */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(agents.length, 3)}, 1fr)`,
        }}
      >
        {agents.map((agent) => (
          <AgentSigmaCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Sigma Legend */}
      <SigmaLegend agents={agents} target={sigmaTarget} />

      {/* Extended Trends: DPMO + Latency with time range selector */}
      <ExtendedTrends
        agents={agents}
        getTrends={getTrends}
        getLatencyTrends={getLatencyTrends}
      />

      {/* Improvement Tracker */}
      <ImprovementTracker history={sigmaHistory} sigmaTarget={sigmaTarget} />
    </div>
  )
}
