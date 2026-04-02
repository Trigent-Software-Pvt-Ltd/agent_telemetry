'use client'

import { useLanguageMode } from '@/hooks/useLanguageMode'
import { useOrganisation } from '@/hooks/useOrganisation'
import { getServqualScores, computeServqualScore } from '@/lib/mock-data'
import type { Agent, RoiSnapshot } from '@/types/telemetry'

interface EquationCenterProps {
  agents: Agent[]
  roi: RoiSnapshot
  agentCoverage: number
  humanCoverage: number
  processId: string
}

export function EquationCenter({ agents, roi, agentCoverage, humanCoverage, processId }: EquationCenterProps) {
  const { mode } = useLanguageMode()
  const { qualityFramework } = useOrganisation()

  // Compute average quality across agents (weighted by total runs)
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0)
  const weightedSuccess = agents.reduce((sum, a) => sum + a.successRate * a.totalRuns, 0)
  const avgQuality = totalRuns > 0 ? Math.round((weightedSuccess / totalRuns) * 100) : 0

  // Weighted sigma
  const weightedSigma = agents.reduce((sum, a) => sum + a.sigmaScore * a.totalRuns, 0)
  const avgSigma = totalRuns > 0 ? (weightedSigma / totalRuns).toFixed(1) : '0.0'

  // SERVQUAL
  const servqualDimensions = getServqualScores(processId)
  const servqualWeighted = Math.round(computeServqualScore(servqualDimensions))
  const isServqual = qualityFramework === 'servqual'

  const agentPct = Math.round(agentCoverage * 100)
  const humanPct = Math.round(humanCoverage * 100)

  const qualityLabel = isServqual
    ? `SERVQUAL ${servqualWeighted}%`
    : mode === 'operations'
      ? `quality ${avgQuality}%`
      : `${avgSigma}\u03C3 avg`

  return (
    <div className="flex flex-col items-center gap-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
      {/* Section label */}
      <div className="mb-4 text-center">
        <h3
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-muted)' }}
        >
          The Equation
        </h3>
      </div>

      {/* Agent card */}
      <div
        className="w-full rounded-xl px-5 py-4 text-center relative"
        style={{
          background: 'linear-gradient(135deg, var(--status-green-bg) 0%, #d1fae5 100%)',
          border: '1.5px solid var(--status-green)',
        }}
      >
        <div className="text-sm font-semibold mb-1" style={{ color: 'var(--status-green)' }}>
          Agent contribution
        </div>
        <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {agentPct}%
          <span className="text-base font-normal mx-1.5" style={{ color: 'var(--text-muted)' }}>&times;</span>
          <span style={{ color: 'var(--status-green)' }}>{qualityLabel}</span>
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          ${roi.grossSavingWeekly.toLocaleString()}/wk gross saving
        </div>
      </div>

      {/* Plus operator */}
      <div className="flex items-center justify-center py-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-muted)' }}
        >
          +
        </div>
      </div>

      {/* Human card */}
      <div
        className="w-full rounded-xl px-5 py-4 text-center"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
        }}
      >
        <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
          Human contribution
        </div>
        <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          {humanPct}%
          <span className="text-base font-normal mx-1.5" style={{ color: 'var(--text-muted)' }}>&times;</span>
          <span style={{ color: 'var(--text-secondary)' }}>productivity</span>
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Retained ownership of complex tasks
        </div>
      </div>

      {/* Equals operator */}
      <div className="flex items-center justify-center py-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-muted)' }}
        >
          =
        </div>
      </div>

      {/* NET ROI — THE HERO ELEMENT */}
      <div
        className="w-full rounded-xl px-5 py-5 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--accent-blue-bg) 0%, #dbeafe 100%)',
          border: '2px solid var(--accent-blue)',
          boxShadow: '0 4px 24px rgba(55, 138, 221, 0.15), 0 1px 4px rgba(55, 138, 221, 0.1)',
        }}
      >
        {/* Subtle background glow */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: 'radial-gradient(ellipse at center, var(--accent-blue) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: 'var(--accent-blue)' }}>
            Total Net ROI
          </div>
          <div
            className="tabular-nums leading-none"
            style={{
              color: 'var(--accent-blue)',
              fontSize: '2.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            ${roi.netRoiWeekly.toLocaleString()}
            <span className="text-lg font-semibold opacity-70">/week</span>
          </div>
          <div className="text-sm mt-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
            after all costs
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            After oversight, governance, and inference costs
          </div>
          <div
            className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold tabular-nums"
            style={{
              background: 'rgba(55, 138, 221, 0.12)',
              color: 'var(--accent-blue)',
            }}
          >
            ${roi.netPerPerson}/person/week
          </div>
        </div>
      </div>
    </div>
  )
}
