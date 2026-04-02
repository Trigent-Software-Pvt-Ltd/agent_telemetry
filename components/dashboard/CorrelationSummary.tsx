'use client'

import { GitBranch, Zap, Lightbulb } from 'lucide-react'
import type { Correlation } from '@/types/telemetry'

export function CorrelationSummary({ correlations }: { correlations: Correlation[] }) {
  const total = correlations.length
  const strong = correlations.filter(c => c.strength === 'Strong').length
  const actionable = correlations.filter(c => c.insight.length > 0).length

  const cards = [
    { label: 'Total Correlations', value: total, icon: GitBranch, color: '#0891B2', bg: '#ECFEFF' },
    { label: 'Strong Correlations', value: strong, icon: Zap, color: '#D4AF37', bg: '#FBF5DC' },
    { label: 'Actionable Insights', value: actionable, icon: Lightbulb, color: '#059669', bg: '#ECFDF5' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.label} className="card animate-fade-up">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: card.bg }}
              >
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold font-[var(--font-sora)] tabular-nums" style={{ color: '#0A1628' }}>
                  {card.value}
                </div>
                <div className="text-xs" style={{ color: '#64748B' }}>{card.label}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
