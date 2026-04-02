import type { AgentRoi } from '@/types/telemetry'

interface AgentRoiCardProps {
  roi: AgentRoi
}

interface WaterfallRow {
  label: string
  value: number
  type: 'positive' | 'negative' | 'net'
}

export default function AgentRoiCard({ roi }: AgentRoiCardProps) {
  const rows: WaterfallRow[] = [
    { label: 'Gross Saving', value: roi.grossSavingWeekly, type: 'positive' },
    { label: 'Inference Cost', value: roi.inferenceCostWeekly, type: 'negative' },
    { label: 'Oversight Alloc.', value: roi.oversightCostWeekly, type: 'negative' },
    { label: 'Governance Alloc.', value: roi.governanceCostWeekly, type: 'negative' },
    { label: 'Net ROI', value: roi.netRoiWeekly, type: 'net' },
  ]

  const maxVal = Math.max(...rows.map(r => Math.abs(r.value)), 1)

  function getColor(type: WaterfallRow['type']): string {
    switch (type) {
      case 'positive': return 'var(--status-green)'
      case 'negative': return 'var(--status-red)'
      case 'net': return roi.netRoiWeekly >= 0 ? 'var(--accent-blue)' : 'var(--status-red)'
    }
  }

  function getBg(type: WaterfallRow['type']): string {
    switch (type) {
      case 'positive': return 'var(--status-green-bg)'
      case 'negative': return 'var(--status-red-bg)'
      case 'net': return roi.netRoiWeekly >= 0 ? 'var(--accent-blue-bg)' : 'var(--status-red-bg)'
    }
  }

  function formatValue(row: WaterfallRow): string {
    if (row.type === 'negative') return `-$${row.value.toLocaleString()}`
    return `$${row.value.toLocaleString()}`
  }

  return (
    <div className="card animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Agent ROI Breakdown
          </h3>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Weekly contribution &middot; {roi.taskTimeWeightPct}% of process time
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-lg text-center"
          style={{ background: getBg('net') }}
        >
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: getColor('net') }}
          >
            ${roi.netRoiWeekly.toLocaleString()}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: getColor('net') }}>
            Net / week
          </div>
        </div>
      </div>

      {/* Waterfall rows */}
      <div className="flex flex-col gap-2.5">
        {rows.map((row) => {
          const barPct = Math.max(8, (Math.abs(row.value) / maxVal) * 100)
          const color = getColor(row.type)
          const bg = getBg(row.type)

          return (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-xs font-medium"
                  style={{
                    color: row.type === 'net' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: row.type === 'net' ? 700 : 500,
                  }}
                >
                  {row.label}
                </span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color }}
                >
                  {formatValue(row)}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: bg }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    background: color,
                    opacity: row.type === 'net' ? 1 : 0.8,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
