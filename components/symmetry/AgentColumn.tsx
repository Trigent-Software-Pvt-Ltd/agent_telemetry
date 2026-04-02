'use client'

import { useLanguageMode } from '@/hooks/useLanguageMode'
import { useOrganisation } from '@/hooks/useOrganisation'
import { getAgentRoisForProcess, getServqualScores, computeServqualScore } from '@/lib/mock-data'
import type { Agent, OnetTask, RoiSnapshot } from '@/types/telemetry'

interface AgentColumnProps {
  agents: Agent[]
  agentTasks: OnetTask[]
  roi: RoiSnapshot
  agentCoverage: number
  processId: string
}

export function AgentColumn({ agents, agentTasks, roi, agentCoverage, processId }: AgentColumnProps) {
  const { mode } = useLanguageMode()
  const { qualityFramework } = useOrganisation()

  // Compute average quality across agents (weighted by total runs)
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0)
  const weightedSuccess = agents.reduce((sum, a) => sum + a.successRate * a.totalRuns, 0)
  const avgQuality = totalRuns > 0 ? weightedSuccess / totalRuns : 0

  // Compute weighted average sigma
  const weightedSigma = agents.reduce((sum, a) => sum + a.sigmaScore * a.totalRuns, 0)
  const avgSigma = totalRuns > 0 ? weightedSigma / totalRuns : 0

  // SERVQUAL data
  const servqualDimensions = getServqualScores(processId)
  const servqualWeighted = computeServqualScore(servqualDimensions)
  const isServqual = qualityFramework === 'servqual'

  // Weekly inference cost
  const weeklyCost = roi.inferenceCostWeekly

  const coveragePct = Math.round(agentCoverage * 100)

  // Per-agent ROI breakdown
  const agentRois = processId ? getAgentRoisForProcess(processId) : []

  // Determine quality metric label, value, and subtitle based on framework + language mode
  let qualityLabel: string
  let qualityValue: string
  let qualitySubtitle: string

  if (isServqual) {
    qualityLabel = 'Service quality'
    qualityValue = `${Math.round(servqualWeighted)}%`
    qualitySubtitle = 'SERVQUAL weighted'
  } else if (mode === 'operations') {
    qualityLabel = 'Avg quality'
    qualityValue = `${Math.round(avgQuality * 100)}%`
    qualitySubtitle = 'success rate'
  } else {
    qualityLabel = 'Sigma average'
    qualityValue = `${avgSigma.toFixed(1)}\u03C3`
    qualitySubtitle = 'process capability'
  }

  return (
    <div className="card flex flex-col gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--status-green)' }}
          />
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            What AI is handling
          </h3>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Coverage */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            Coverage
          </div>
          <div className="text-3xl font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
            {coveragePct}%
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            of role tasks
          </div>
        </div>

        {/* Quality metric — switches with framework and language mode */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            {qualityLabel}
          </div>
          <div className="text-3xl font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
            {qualityValue}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {qualitySubtitle}
          </div>
        </div>
      </div>

      {/* SERVQUAL dimension breakdown */}
      {isServqual && servqualDimensions.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            SERVQUAL dimensions
          </div>
          <div className="flex flex-col gap-2">
            {servqualDimensions.map((dim) => {
              const barColor = dim.score >= 80 ? 'var(--status-green)' : dim.score >= 65 ? '#BA7517' : '#E24B4A'
              return (
                <div key={dim.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {dim.name}
                      <span className="ml-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        ({Math.round(dim.weight * 100)}%)
                      </span>
                    </span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {dim.score}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${dim.score}%`, background: barColor }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Weekly cost */}
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          Weekly inference cost
        </span>
        <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
          ${weeklyCost}
        </span>
      </div>

      {/* Per-agent ROI breakdown */}
      {agentRois.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            Per-agent ROI (weekly)
          </div>
          <div className="flex flex-col gap-2">
            {agentRois.map((ar) => {
              const isPositive = ar.netRoiWeekly >= 0
              return (
                <div
                  key={ar.agentId}
                  className="rounded-lg px-3 py-2.5"
                  style={{
                    background: isPositive ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
                    border: `1px solid ${isPositive ? 'var(--status-green)' : 'var(--status-red)'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {ar.agentName}
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: isPositive ? 'var(--status-green)' : 'var(--status-red)' }}
                    >
                      ${ar.netRoiWeekly.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    <span>Saving ${ar.grossSavingWeekly}</span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <span>Inference ${ar.inferenceCostWeekly.toFixed(2)}</span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <span>{ar.taskTimeWeightPct}% time</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agent tasks */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Top agent tasks
        </div>
        <div className="flex flex-col gap-2">
          {agentTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg px-3 py-2.5 flex items-start gap-3"
              style={{ background: 'var(--status-green-bg)' }}
            >
              <div
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--status-green)' }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {task.task}
                </div>
                <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span>{Math.round(task.timeWeight * 100)}% of time</span>
                  {task.agentName && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>|</span>
                      <span>{task.agentName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
