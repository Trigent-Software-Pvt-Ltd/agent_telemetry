'use client'

import type { GovernanceViolation } from '@/types/telemetry'
import { AlertTriangle } from 'lucide-react'

interface ViolationsListProps {
  violations: GovernanceViolation[]
}

export function ViolationsList({ violations }: ViolationsListProps) {
  if (violations.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-sm" style={{ color: 'var(--vip-muted)' }}>No violations detected</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
        Non-Compliant Items
      </h3>
      {violations.map(v => (
        <div
          key={v.id}
          className="card flex items-start gap-3"
          style={{ borderLeft: '3px solid var(--v-red)' }}
        >
          <AlertTriangle size={18} style={{ color: 'var(--v-red)', flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold" style={{ color: 'var(--vip-navy)' }}>
                {v.agentName}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--v-red-bg)', color: 'var(--v-red)' }}>
                {v.ruleName}
              </span>
            </div>
            <p className="text-xs mb-1" style={{ color: 'var(--vip-muted)' }}>
              {v.description}
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--v-amber)' }}>
              Recommended: {v.recommendedAction}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
