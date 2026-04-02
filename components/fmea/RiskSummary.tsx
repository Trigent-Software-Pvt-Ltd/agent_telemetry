import { getFmeaEntries } from '@/lib/mock-data'
import { AlertTriangle, ShieldAlert, CircleDot, ShieldCheck } from 'lucide-react'

export function RiskSummary() {
  const entries = getFmeaEntries()
  const total = entries.length
  const critical = entries.filter(e => e.rpn > 200).length
  const open = entries.filter(e => e.status === 'open').length
  const mitigated = entries.filter(e => e.status === 'mitigated').length

  const cards = [
    {
      label: 'Total Risk Items',
      value: total,
      icon: CircleDot,
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-bg)',
    },
    {
      label: 'Critical (RPN > 200)',
      value: critical,
      icon: ShieldAlert,
      color: 'var(--status-red)',
      bg: 'var(--status-red-bg)',
    },
    {
      label: 'Open Items',
      value: open,
      icon: AlertTriangle,
      color: 'var(--status-amber)',
      bg: 'var(--status-amber-bg)',
    },
    {
      label: 'Mitigated',
      value: mitigated,
      icon: ShieldCheck,
      color: 'var(--status-green)',
      bg: 'var(--status-green-bg)',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 44,
              height: 44,
              background: card.bg,
              color: card.color,
            }}
          >
            <card.icon size={22} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {card.label}
            </p>
            <p className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
