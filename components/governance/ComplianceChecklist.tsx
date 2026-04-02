'use client'

import type { ComplianceRequirement, ComplianceStatus } from '@/types/telemetry'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'

interface ComplianceChecklistProps {
  requirements: ComplianceRequirement[]
}

const statusConfig: Record<ComplianceStatus, { label: string; bg: string; color: string; Icon: typeof CheckCircle2 }> = {
  PASS: { label: 'PASS', bg: 'var(--status-green-bg)', color: 'var(--status-green)', Icon: CheckCircle2 },
  PARTIAL: { label: 'PARTIAL', bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', Icon: AlertCircle },
  NOT_STARTED: { label: 'NOT STARTED', bg: 'var(--status-red-bg)', color: 'var(--status-red)', Icon: XCircle },
}

export function ComplianceChecklist({ requirements }: ComplianceChecklistProps) {
  return (
    <div className="card overflow-hidden">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: 'var(--vip-navy)' }}>
        ISO 42001 / EU AI Act Checklist
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>#</th>
              <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Requirement</th>
              <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((req, i) => {
              const cfg = statusConfig[req.status]
              const Icon = cfg.Icon
              return (
                <tr key={req.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-3 px-3 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td className="py-3 px-3 text-sm" style={{ color: 'var(--text-primary)' }}>{req.requirement}</td>
                  <td className="py-3 px-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs" style={{ color: 'var(--text-muted)' }}>{req.detail || '--'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
