'use client'

import { useCountUp } from '@/hooks/useCountUp'

const stats = [
  { label: 'Total decisions', value: 15, suffix: '' },
  { label: 'Override rate', value: 27, suffix: '%' },
  { label: 'Avg review time', value: 4.2, suffix: ' min', decimals: 1 },
  { label: 'Compliance', value: 93, suffix: '%' },
]

export function AuditSummary() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <SummaryCard key={s.label} {...s} />
      ))}
    </div>
  )
}

function SummaryCard({ label, value, suffix, decimals = 0 }: {
  label: string
  value: number
  suffix: string
  decimals?: number
}) {
  const animated = useCountUp(value, 600, decimals)

  return (
    <div className="card flex flex-col gap-1">
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: '#64748B' }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums font-[var(--font-sora)]"
        style={{ color: '#0A1628' }}
      >
        {animated}{suffix}
      </span>
    </div>
  )
}
