'use client'

interface ResultItem {
  label: string
  value: string
  detail?: string
  positive?: boolean
}

interface Props {
  items: ResultItem[]
  ceoReads: string
}

export function ScenarioResults({ items, ceoReads }: Props) {
  return (
    <div className="flex flex-col gap-3 mt-4">
      {/* CEO-level summary */}
      <div
        className="rounded-lg px-4 py-3 text-sm font-medium"
        style={{
          background: 'var(--status-green-bg)',
          border: '1px solid var(--status-green)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-dm)',
        }}
      >
        {ceoReads}
      </div>

      {/* Metric breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg px-3 py-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: 'var(--text-muted)' }}
            >
              {item.label}
            </div>
            <div
              className="text-lg font-bold tabular-nums"
              style={{
                fontFamily: 'var(--font-sora)',
                color: item.positive === false ? 'var(--status-red)' : 'var(--status-green)',
              }}
            >
              {item.value}
            </div>
            {item.detail && (
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                {item.detail}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
