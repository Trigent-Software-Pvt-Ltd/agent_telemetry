import Link from 'next/link'
import type { Process } from '@/types/telemetry'
import { AGENTS, ROI_SNAPSHOTS, LANGUAGE_MODES } from '@/lib/mock-data'

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  green: { bg: 'var(--status-green-bg)', text: 'var(--status-green)', label: 'GREEN' },
  amber: { bg: 'var(--status-amber-bg)', text: 'var(--status-amber)', label: 'AMBER' },
  red:   { bg: 'var(--status-red-bg)',   text: 'var(--status-red)',   label: 'RED' },
}

export function ProcessCard({ process }: { process: Process }) {
  const vocab = LANGUAGE_MODES.operations
  const statusStyle = statusColors[process.status]
  const processAgents = AGENTS.filter((a) => a.processId === process.id)
  const roi = ROI_SNAPSHOTS.find((r) => r.processId === process.id)

  const statusDescription = vocab[process.status as keyof typeof vocab] ?? process.status
  const agentCount = processAgents.length
  const automatedPct = Math.round(process.agentCoverage * 100)

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide"
              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
            >
              {statusStyle.label}
            </span>
            <h3
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
            >
              {process.name}
            </h3>
            <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
              O*NET {process.onetCode}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {statusDescription} · {agentCount} agent{agentCount !== 1 ? 's' : ''} · {automatedPct}% automated
          </p>
        </div>
        <Link
          href={`/process/${process.id}`}
          className="shrink-0 text-sm font-medium transition-colors hover:underline"
          style={{ color: 'var(--accent-blue)' }}
        >
          View details &rarr;
        </Link>
      </div>

      {roi && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: 'var(--surface)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: 'var(--status-green)' }}>
            <path d="M8 1v14M4.5 4C4.5 2.9 6 2 8 2s3.5.9 3.5 2S10 6 8 6 4.5 5.1 4.5 4zM11.5 8c0 1.1-1.5 2-3.5 2S4.5 9.1 4.5 8M11.5 12c0 1.1-1.5 2-3.5 2s-3.5-.9-3.5-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Saving {formatCurrency(roi.netRoiWeekly)}/week after all costs
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ({formatCurrency(roi.grossSavingWeekly)} gross − {formatCurrency(roi.oversightCostWeekly + roi.inferenceCostWeekly + roi.governanceOverheadWeekly)} costs)
          </span>
        </div>
      )}

      {/* Agent summary row */}
      <div className="flex flex-wrap gap-2">
        {processAgents.map((agent) => {
          const agentStatus = statusColors[agent.status]
          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors hover:bg-[var(--surface)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: agentStatus.text }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {agent.name}
              </span>
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                {agent.sigmaScore}σ
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
