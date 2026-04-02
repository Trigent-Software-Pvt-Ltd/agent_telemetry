'use client'

import { SlaConfigPanel } from '@/components/settings/SlaConfigPanel'
import { AlertRulesPanel } from '@/components/settings/AlertRulesPanel'
import { AlertHistory } from '@/components/settings/AlertHistory'
import { ShieldAlert } from 'lucide-react'

export default function AlertsSlaPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: '#FFFBEB' }}
        >
          <ShieldAlert size={20} style={{ color: '#D97706' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Alerts & SLA
          </h1>
          <p className="text-[12px]" style={{ color: '#64748B' }}>
            Configure per-agent SLA targets and alert rules
          </p>
        </div>
      </div>

      {/* Section 1: SLA Configuration */}
      <SlaConfigPanel />

      {/* Divider */}
      <hr style={{ borderColor: '#E2E8F0' }} />

      {/* Section 2: Alert Rules */}
      <AlertRulesPanel />

      {/* Divider */}
      <hr style={{ borderColor: '#E2E8F0' }} />

      {/* Section 3: Alert History */}
      <AlertHistory />
    </div>
  )
}
