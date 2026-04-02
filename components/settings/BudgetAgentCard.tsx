'use client'

import { useState } from 'react'
import { AgentBudget } from '@/lib/mock-data'
import { Bot, AlertCircle } from 'lucide-react'

interface Props {
  budget: AgentBudget
  onCapChange: (agentId: string, newCap: number) => void
  onThresholdChange: (agentId: string, threshold: number) => void
}

export function BudgetAgentCard({ budget, onCapChange, onThresholdChange }: Props) {
  const [editingCap, setEditingCap] = useState(false)
  const [capInput, setCapInput] = useState(String(budget.monthlyCap))

  const utilization = budget.monthlyCap > 0 ? (budget.currentSpend / budget.monthlyCap) * 100 : 0
  const utilizationColor = utilization < 60 ? '#059669' : utilization < 80 ? '#D97706' : '#DC2626'
  const utilizationBg = utilization < 60 ? '#ECFDF5' : utilization < 80 ? '#FFFBEB' : '#FFF5F5'

  const dailyRate = budget.currentSpend / 22 // mock day-of-month
  const daysUntilCap = dailyRate > 0 ? Math.round((budget.monthlyCap - budget.currentSpend) / dailyRate) : 999

  const handleCapSave = () => {
    const val = parseFloat(capInput)
    if (!isNaN(val) && val > 0) {
      onCapChange(budget.agentId, val)
    }
    setEditingCap(false)
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#E8EEF5' }}>
          <Bot size={18} style={{ color: '#0A1628' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: '#0A1628' }}>{budget.agentName}</div>
          <div className="text-xs font-[var(--font-mono-jb)]" style={{ color: '#64748B' }}>{budget.model}</div>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums"
          style={{ background: utilizationBg, color: utilizationColor }}
        >
          {utilization.toFixed(0)}%
        </div>
      </div>

      {/* Budget bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: '#64748B' }}>
            ${budget.currentSpend.toLocaleString()} of ${budget.monthlyCap.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full" style={{ background: '#E2E8F0' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(utilization, 100)}%`,
              background: utilizationColor,
            }}
          />
        </div>
      </div>

      {/* Monthly Cap Input */}
      <div className="mb-3">
        <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Monthly Cap ($)</label>
        {editingCap ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={capInput}
              onChange={e => setCapInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCapSave()}
              className="flex-1 px-3 py-1.5 rounded-lg border text-sm font-[var(--font-mono-jb)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              style={{ borderColor: '#E2E8F0' }}
              autoFocus
            />
            <button
              onClick={handleCapSave}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: '#D4AF37' }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setCapInput(String(budget.monthlyCap)); setEditingCap(true) }}
            className="w-full text-left px-3 py-1.5 rounded-lg border text-sm font-[var(--font-mono-jb)] hover:border-[#D4AF37] transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#0A1628' }}
          >
            ${budget.monthlyCap.toLocaleString()}
          </button>
        )}
      </div>

      {/* Alert threshold */}
      <div className="mb-3">
        <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Alert at utilization (%)</label>
        <select
          value={budget.alertThreshold}
          onChange={e => onThresholdChange(budget.agentId, Number(e.target.value))}
          className="w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          style={{ borderColor: '#E2E8F0', color: '#0A1628' }}
        >
          <option value={70}>70%</option>
          <option value={80}>80%</option>
          <option value={90}>90%</option>
        </select>
      </div>

      {/* Projected info */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: daysUntilCap <= 5 ? '#FFF5F5' : '#F7F9FC' }}>
        <AlertCircle size={14} style={{ color: daysUntilCap <= 5 ? '#DC2626' : '#64748B' }} />
        <span className="text-xs" style={{ color: daysUntilCap <= 5 ? '#DC2626' : '#64748B' }}>
          {daysUntilCap <= 0
            ? 'Budget cap exceeded'
            : `Will hit cap in ~${daysUntilCap} days at current rate`}
        </span>
      </div>
    </div>
  )
}
