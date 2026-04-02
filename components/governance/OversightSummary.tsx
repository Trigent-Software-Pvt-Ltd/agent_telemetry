'use client'

import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import type { OversightGap } from '@/lib/mock-data'

interface OversightSummaryProps {
  gaps: OversightGap[]
}

export function OversightSummary({ gaps }: OversightSummaryProps) {
  const highCount = gaps.filter(g => g.riskLevel === 'High').length
  const mediumCount = gaps.filter(g => g.riskLevel === 'Medium').length
  const lowCount = gaps.filter(g => g.riskLevel === 'Low').length

  const cards = [
    {
      label: 'Total gaps',
      value: gaps.length,
      icon: ShieldAlert,
      color: 'var(--text-primary)',
      bg: 'var(--surface)',
      iconBg: 'var(--accent-blue)',
    },
    {
      label: 'High risk',
      value: highCount,
      icon: AlertTriangle,
      color: 'var(--status-red)',
      bg: 'var(--status-red-bg)',
      iconBg: 'var(--status-red)',
    },
    {
      label: 'Medium risk',
      value: mediumCount,
      icon: AlertCircle,
      color: 'var(--status-amber)',
      bg: 'var(--status-amber-bg)',
      iconBg: 'var(--status-amber)',
    },
    {
      label: 'Low risk',
      value: lowCount,
      icon: CheckCircle,
      color: 'var(--status-green)',
      bg: 'var(--status-green-bg)',
      iconBg: 'var(--status-green)',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="card flex items-center gap-4"
            style={{ background: card.bg }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: card.iconBg, color: '#fff' }}
            >
              <Icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
