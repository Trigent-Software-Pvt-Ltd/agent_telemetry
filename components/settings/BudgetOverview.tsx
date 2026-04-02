'use client'

import { AgentBudget } from '@/lib/mock-data'
import { DollarSign, TrendingUp, Wallet, AlertTriangle } from 'lucide-react'

interface Props {
  budgets: AgentBudget[]
}

export function BudgetOverview({ budgets }: Props) {
  const totalBudget = budgets.reduce((s, b) => s + b.monthlyCap, 0)
  const totalSpend = budgets.reduce((s, b) => s + b.currentSpend, 0)
  const remaining = totalBudget - totalSpend
  const totalProjected = budgets.reduce((s, b) => s + b.projectedSpend, 0)
  const projectedOver = totalProjected > totalBudget

  const cards = [
    {
      label: 'Total Budget',
      value: `$${totalBudget.toLocaleString()}`,
      icon: Wallet,
      color: '#0A1628',
      bg: '#E8EEF5',
    },
    {
      label: 'Total Spend (MTD)',
      value: `$${totalSpend.toLocaleString()}`,
      icon: DollarSign,
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      label: 'Remaining',
      value: `$${remaining.toLocaleString()}`,
      icon: TrendingUp,
      color: remaining < totalBudget * 0.2 ? '#DC2626' : '#D97706',
      bg: remaining < totalBudget * 0.2 ? '#FFF5F5' : '#FFFBEB',
    },
    {
      label: 'Projected EOM',
      value: `$${totalProjected.toLocaleString()}`,
      icon: AlertTriangle,
      color: projectedOver ? '#DC2626' : '#059669',
      bg: projectedOver ? '#FFF5F5' : '#ECFDF5',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div key={card.label} className="card flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: card.bg }}
            >
              <Icon size={20} style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
                {card.label}
              </div>
              <div className="text-lg font-bold font-[var(--font-sora)] tabular-nums" style={{ color: '#0A1628' }}>
                {card.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
