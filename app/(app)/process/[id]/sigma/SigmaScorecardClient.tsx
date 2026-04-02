'use client'

import { AgentSigmaCard } from '@/components/sigma/AgentSigmaCard'
import { SigmaLegend } from '@/components/sigma/SigmaLegend'
import { DpmoTrendChart } from '@/components/sigma/DpmoTrendChart'
import { ImprovementTracker } from '@/components/sigma/ImprovementTracker'
import type { Process, Agent, SigmaTrendPoint } from '@/types/telemetry'
import type { SigmaHistoryEntry } from '@/lib/mock-data'

interface SigmaScorecardClientProps {
  process: Process
  agents: Agent[]
  trends: Record<string, SigmaTrendPoint[]>
  sigmaTarget: number
  sigmaHistory: SigmaHistoryEntry[]
}

export function SigmaScorecardClient({ process, agents, trends, sigmaTarget, sigmaHistory }: SigmaScorecardClientProps) {
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

      {/* DPMO Trend Chart */}
      <DpmoTrendChart agents={agents} trends={trends} />

      {/* Improvement Tracker */}
      <ImprovementTracker history={sigmaHistory} sigmaTarget={sigmaTarget} />
    </div>
  )
}
