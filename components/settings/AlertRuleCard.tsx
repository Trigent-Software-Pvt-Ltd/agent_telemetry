'use client'

import { AlertRule, AGENTS } from '@/lib/mock-data'
import { ToggleLeft, ToggleRight } from 'lucide-react'

interface AlertRuleCardProps {
  rule: AlertRule
  onChange: (updated: AlertRule) => void
}

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  Critical: { bg: '#FFF5F5', color: '#DC2626' },
  Warning: { bg: '#FFFBEB', color: '#D97706' },
  Info: { bg: '#E8EEF5', color: '#64748B' },
}

const uniqueAgents = AGENTS.map(a => a.name)

export function AlertRuleCard({ rule, onChange }: AlertRuleCardProps) {
  const sevStyle = SEVERITY_COLORS[rule.severity]

  const update = (partial: Partial<AlertRule>) => {
    onChange({ ...rule, ...partial })
  }

  return (
    <div
      className="card"
      style={{
        padding: '16px 20px',
        opacity: rule.enabled ? 1 : 0.6,
        borderLeft: `3px solid ${rule.enabled ? sevStyle.color : '#E2E8F0'}`,
      }}
    >
      {/* Top row: toggle + name + severity */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => update({ enabled: !rule.enabled })}
            className="cursor-pointer"
            style={{ color: rule.enabled ? '#D4AF37' : '#94A3B8' }}
            aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
          >
            {rule.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>{rule.name}</div>
            <div className="text-[11px]" style={{ color: '#64748B' }}>{rule.description}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity selector */}
          <select
            value={rule.severity}
            onChange={e => update({ severity: e.target.value as AlertRule['severity'] })}
            className="text-[11px] font-semibold px-2 py-1 rounded-full border-none cursor-pointer"
            style={{ background: sevStyle.bg, color: sevStyle.color }}
          >
            <option value="Critical">Critical</option>
            <option value="Warning">Warning</option>
            <option value="Info">Info</option>
          </select>
        </div>
      </div>

      {/* Threshold + scope */}
      <div className="flex items-end gap-6">
        {/* Threshold control */}
        <div className="flex-1">
          <label className="text-[11px] font-medium block mb-1" style={{ color: '#64748B' }}>
            Threshold: {rule.unit === '$' ? `$${rule.threshold}` : `${rule.threshold}${rule.unit}`}
          </label>
          {rule.inputType === 'slider' ? (
            <input
              type="range"
              min={rule.min}
              max={rule.max}
              step={rule.step}
              value={rule.threshold}
              onChange={e => update({ threshold: Number(e.target.value) })}
              className="w-full accent-[#D4AF37]"
              disabled={!rule.enabled}
            />
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm" style={{ color: '#64748B' }}>$</span>
              <input
                type="number"
                min={rule.min}
                max={rule.max}
                step={rule.step}
                value={rule.threshold}
                onChange={e => update({ threshold: Number(e.target.value) })}
                disabled={!rule.enabled}
                className="w-32 px-2 py-1 rounded-lg border text-sm font-[var(--font-mono-jb)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                style={{ borderColor: '#E2E8F0' }}
              />
            </div>
          )}
        </div>

        {/* Scope selector */}
        <div>
          <label className="text-[11px] font-medium block mb-1" style={{ color: '#64748B' }}>
            Scope
          </label>
          <select
            value={rule.scope}
            onChange={e => update({ scope: e.target.value })}
            disabled={!rule.enabled}
            className="text-[12px] px-2 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            style={{ borderColor: '#E2E8F0', color: '#0A1628', minWidth: 140 }}
          >
            <option value="all">All agents</option>
            {uniqueAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
