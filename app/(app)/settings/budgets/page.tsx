'use client'

import { useState } from 'react'
import { BudgetOverview } from '@/components/settings/BudgetOverview'
import { BudgetAgentCard } from '@/components/settings/BudgetAgentCard'
import { BudgetChart } from '@/components/settings/BudgetChart'
import { getAgentBudgets, type AgentBudget } from '@/lib/mock-data'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<AgentBudget[]>(getAgentBudgets)

  const handleCapChange = (agentId: string, newCap: number) => {
    setBudgets(prev =>
      prev.map(b =>
        b.agentId === agentId ? { ...b, monthlyCap: newCap } : b
      )
    )
  }

  const handleThresholdChange = (agentId: string, threshold: number) => {
    setBudgets(prev =>
      prev.map(b =>
        b.agentId === agentId ? { ...b, alertThreshold: threshold } : b
      )
    )
  }

  const handleSave = () => {
    toast.success('Budget caps saved successfully.')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Budget Controls
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Configure per-agent spending caps, alerts, and monitor utilization.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: '#D4AF37', color: '#0A1628' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#A8891A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#D4AF37')}
        >
          <Save size={16} />
          Save Budget Caps
        </button>
      </div>

      {/* Summary cards */}
      <BudgetOverview budgets={budgets} />

      {/* Per-agent cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Per-Agent Budget Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => (
            <BudgetAgentCard
              key={b.agentId}
              budget={b}
              onCapChange={handleCapChange}
              onThresholdChange={handleThresholdChange}
            />
          ))}
        </div>
      </div>

      {/* Monthly chart */}
      <BudgetChart budgets={budgets} />
    </div>
  )
}
