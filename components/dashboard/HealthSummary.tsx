import { PROCESSES, AGENTS, ORGANISATION } from '@/lib/mock-data'

export function HealthSummary() {
  const sigmaTarget = ORGANISATION.sigmaTarget
  const processCount = PROCESSES.length

  // Categorize processes by health
  const processHealth = PROCESSES.map((proc) => {
    const processAgents = AGENTS.filter((a) => a.processId === proc.id)
    const allAboveTarget = processAgents.length > 0 && processAgents.every((a) => a.sigmaScore >= sigmaTarget)
    const anyDeclining = processAgents.some((a) => a.sigmaTrend === 'down' || a.sigmaScore < sigmaTarget - 0.5)
    return {
      process: proc,
      status: allAboveTarget ? 'on-track' as const : anyDeclining ? 'needs-attention' as const : 'monitoring' as const,
    }
  })

  const onTrackCount = processHealth.filter((p) => p.status === 'on-track').length
  const monitoringCount = processHealth.filter((p) => p.status === 'monitoring').length
  const needsAttentionCount = processHealth.filter((p) => p.status === 'needs-attention').length

  // Build the description text
  const parts: string[] = []
  parts.push(`${processCount} process${processCount !== 1 ? 'es' : ''} active`)
  if (onTrackCount > 0) parts.push(`${onTrackCount} performing well`)
  if (monitoringCount > 0) parts.push(`${monitoringCount} being monitored`)
  if (needsAttentionCount > 0) parts.push(`${needsAttentionCount} needs attention`)
  const description = parts.join(' · ')

  return (
    <div className="card flex items-center gap-4">
      {/* Visual dots */}
      <div className="flex items-center gap-1.5">
        {processHealth.map((ph) => (
          <div
            key={ph.process.id}
            className={`h-3 w-3 rounded-full ${
              ph.status === 'on-track'
                ? 'status-dot-green'
                : ph.status === 'monitoring'
                  ? 'status-dot-amber'
                  : 'status-dot-red'
            }`}
            style={{
              backgroundColor:
                ph.status === 'on-track'
                  ? 'var(--status-green)'
                  : ph.status === 'monitoring'
                    ? 'var(--status-amber)'
                    : 'var(--status-red)',
            }}
            title={ph.process.name}
          />
        ))}
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          Process Health
        </span>
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </span>
      </div>
    </div>
  )
}
