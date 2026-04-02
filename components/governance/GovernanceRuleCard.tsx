'use client'

import type { GovernanceRule, EnforcementLevel, Geography } from '@/types/telemetry'
import { ShieldCheck, ShieldAlert, ShieldOff, Globe } from 'lucide-react'
import clsx from 'clsx'

interface GovernanceRuleCardProps {
  rule: GovernanceRule
  geography?: Geography
  onToggleActive: (id: string) => void
  onChangeEnforcement: (id: string, level: EnforcementLevel) => void
  onChangeGeography?: (id: string, geo: Geography) => void
}

const ENFORCEMENT_LEVELS: EnforcementLevel[] = ['Block', 'Warn', 'Log']
const GEOGRAPHIES: Geography[] = ['Global', 'EU', 'US', 'APAC']

const enforcementColors: Record<EnforcementLevel, string> = {
  Block: 'var(--v-red)',
  Warn: 'var(--v-amber)',
  Log: 'var(--vip-muted)',
}

export function GovernanceRuleCard({ rule, geography = 'Global', onToggleActive, onChangeEnforcement, onChangeGeography }: GovernanceRuleCardProps) {
  const statusColor = !rule.active
    ? 'var(--vip-muted-light)'
    : rule.satisfied
      ? 'var(--v-green)'
      : 'var(--v-red)'

  const StatusIcon = !rule.active
    ? ShieldOff
    : rule.satisfied
      ? ShieldCheck
      : ShieldAlert

  return (
    <div
      className={clsx('card flex items-start gap-4', !rule.active && 'opacity-60')}
      style={{ borderLeft: `3px solid ${statusColor}` }}
    >
      <StatusIcon size={20} style={{ color: statusColor, flexShrink: 0, marginTop: 2 }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold" style={{ color: 'var(--vip-navy)' }}>
            {rule.name}
          </span>
          {!rule.active && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--vip-navy-100)', color: 'var(--vip-muted)' }}>
              Disabled
            </span>
          )}
          {rule.active && !rule.satisfied && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--v-red-bg)', color: 'var(--v-red)' }}>
              Violated
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: 'var(--vip-muted)' }}>
          {rule.condition}
        </p>
      </div>

      {/* Geography selector */}
      {onChangeGeography && (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Globe size={12} style={{ color: 'var(--vip-muted)' }} />
          <select
            value={geography}
            onChange={e => onChangeGeography(rule.id, e.target.value as Geography)}
            className="text-[10px] font-semibold rounded px-1.5 py-1 border-0 cursor-pointer"
            style={{
              background: 'var(--vip-navy-100)',
              color: 'var(--vip-navy)',
              outline: 'none',
            }}
          >
            {GEOGRAPHIES.map(geo => (
              <option key={geo} value={geo}>{geo}</option>
            ))}
          </select>
        </div>
      )}

      {/* Enforcement toggle */}
      <div className="flex gap-1 rounded-md p-0.5" style={{ background: 'var(--vip-navy-100)' }}>
        {ENFORCEMENT_LEVELS.map(level => (
          <button
            key={level}
            onClick={() => onChangeEnforcement(rule.id, level)}
            className="px-2 py-1 text-[10px] font-semibold rounded transition-all"
            style={{
              background: rule.enforcement === level ? '#fff' : 'transparent',
              color: rule.enforcement === level ? enforcementColors[level] : 'var(--vip-muted-light)',
              boxShadow: rule.enforcement === level ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Active toggle */}
      <button
        onClick={() => onToggleActive(rule.id)}
        className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
        style={{
          background: rule.active ? 'var(--v-green)' : 'var(--vip-border)',
        }}
        aria-label={`Toggle rule ${rule.name}`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
          style={{
            left: rule.active ? '22px' : '2px',
          }}
        />
      </button>
    </div>
  )
}
