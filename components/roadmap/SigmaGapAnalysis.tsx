import type { Agent } from '@/types/telemetry'

interface SigmaGapAnalysisProps {
  agents: Agent[]
  targetSigma: number
}

export function SigmaGapAnalysis({ agents, targetSigma }: SigmaGapAnalysisProps) {
  return (
    <div className="card animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
        Sigma Gap Analysis
      </h3>
      <p className="text-xs text-text-secondary mb-4">
        Target: {targetSigma.toFixed(1)}&sigma; minimum for all agents
      </p>

      <div className="space-y-4">
        {agents.map((agent) => {
          const gap = targetSigma - agent.sigmaScore
          const aboveTarget = gap <= 0
          const isCritical = gap >= 1.0
          const progressPct = Math.min((agent.sigmaScore / targetSigma) * 100, 100)

          return (
            <div key={agent.id} className="space-y-2">
              {/* Agent header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {agent.name}
                </span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{
                    color: aboveTarget
                      ? 'var(--status-green)'
                      : isCritical
                        ? 'var(--status-red)'
                        : 'var(--status-amber)',
                  }}
                >
                  {agent.sigmaScore.toFixed(1)}&sigma;
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: aboveTarget
                        ? 'var(--status-green)'
                        : isCritical
                          ? 'var(--status-red)'
                          : 'var(--status-amber)',
                    }}
                  />
                </div>
                {/* Target marker */}
                <div
                  className="absolute top-0 h-3 w-0.5"
                  style={{
                    left: '100%',
                    backgroundColor: 'var(--text-primary)',
                    transform: 'translateX(-1px)',
                  }}
                />
              </div>

              {/* Status text */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-secondary">
                  Current: {agent.sigmaScore.toFixed(1)}&sigma; &rarr; Target: {targetSigma.toFixed(1)}&sigma;
                </span>
                {aboveTarget ? (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded"
                    style={{ color: 'var(--status-green)', backgroundColor: 'var(--status-green-bg)' }}
                  >
                    Above target
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded"
                    style={{
                      color: isCritical ? 'var(--status-red)' : 'var(--status-amber)',
                      backgroundColor: isCritical ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                    }}
                  >
                    Gap: {gap.toFixed(1)}&sigma;{isCritical ? ' (Critical)' : ''}
                  </span>
                )}
              </div>

              {/* Action item */}
              {!aboveTarget && (
                <div
                  className="p-2.5 rounded-lg text-xs"
                  style={{
                    backgroundColor: isCritical ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                    color: isCritical ? 'var(--status-red)' : 'var(--status-amber)',
                  }}
                >
                  {isCritical
                    ? `Critical: Reduce failure rate from ${agent.defects.failures} to < ${Math.ceil(agent.totalRuns * 0.04)} per ${agent.totalRuns} runs`
                    : `Improve: Reduce defects by ${Math.ceil((gap / agent.sigmaScore) * agent.defects.failures)} to reach ${targetSigma.toFixed(1)}\u03C3`}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
