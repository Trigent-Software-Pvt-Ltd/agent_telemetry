import Link from 'next/link'
import { AGENTS, ORGANISATION, ROI_SNAPSHOTS } from '@/lib/mock-data'

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

/** Estimate projected additional cost over 90 days for a declining agent */
function estimateCostOfInaction(agent: (typeof AGENTS)[number]): number {
  const roi = ROI_SNAPSHOTS.find((r) => r.processId === agent.processId)
  if (!roi) return 0
  // Rough heuristic: the further below target, the higher the cost.
  // Use difference from target sigma * weekly inference cost * 13 weeks (90 days)
  const sigmaDelta = Math.max(0, ORGANISATION.sigmaTarget - agent.sigmaScore)
  const weeklyAgentCost = agent.avgCostPerRun * agent.totalRuns
  // Projected cost = sigma gap * base cost amplifier * 13 weeks
  return Math.round(sigmaDelta * weeklyAgentCost * 13 * 10)
}

export function AttentionRequired() {
  const target = ORGANISATION.sigmaTarget

  // Agents declining or significantly below target
  const flaggedAgents = AGENTS.filter(
    (a) => a.sigmaTrend === 'down' || a.sigmaScore < target - 0.5
  ).sort((a, b) => a.sigmaScore - b.sigmaScore)

  if (flaggedAgents.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h2
        className="text-sm font-semibold uppercase tracking-[0.06em]"
        style={{ color: 'var(--status-amber)', fontFamily: 'var(--font-sora)' }}
      >
        Attention Required
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {flaggedAgents.map((agent) => {
          const isRed = agent.sigmaScore < 3.0
          const projectedCost = estimateCostOfInaction(agent)
          const trendArrow = agent.sigmaTrend === 'down' ? ' \u2193' : agent.sigmaTrend === 'up' ? ' \u2191' : ''
          const trendLabel =
            agent.sigmaTrend === 'down'
              ? 'declining'
              : agent.sigmaTrend === 'flat'
                ? 'stalled'
                : 'improving'

          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="card flex flex-col gap-2 transition-colors"
              style={{
                borderColor: isRed ? 'var(--status-red)' : 'var(--status-amber)',
                borderLeftWidth: 3,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
                >
                  {agent.name.replace(' Agent', '')}
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: isRed ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                    color: isRed ? 'var(--status-red)' : 'var(--status-amber)',
                  }}
                >
                  {agent.sigmaScore}σ{trendArrow}
                </span>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {agent.name.replace(' Agent', '')} is {trendLabel} ({agent.sigmaScore}σ
                {agent.sigmaTrend === 'down' ? ` from ${agent.sigmaPrev}σ` : ''})
                {projectedCost > 0 && (
                  <>
                    {' '}
                    — projected {formatCurrency(projectedCost)} additional cost over 90 days if not
                    addressed
                  </>
                )}
              </p>

              <span
                className="text-[11px] font-medium"
                style={{ color: 'var(--accent-blue)' }}
              >
                View agent details &rarr;
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
