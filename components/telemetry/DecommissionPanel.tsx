'use client'

import { DecommissionImpact } from '@/types/telemetry'
import { AlertTriangle, ArrowDown, X } from 'lucide-react'

interface DecommissionPanelProps {
  impact: DecommissionImpact
  mode: 'decommission' | 'pause'
  onConfirm: () => void
  onCancel: () => void
}

export function DecommissionPanel({ impact, mode, onConfirm, onCancel }: DecommissionPanelProps) {
  const isDecommission = mode === 'decommission'
  const title = isDecommission ? 'Decommission Agent' : 'Pause Agent'
  const actionLabel = isDecommission ? 'Confirm Decommission' : 'Confirm Pause'
  const actionColor = isDecommission ? '#DC2626' : '#D97706'
  const description = isDecommission
    ? 'This action will permanently remove the agent from the workflow. Tasks will revert to manual handling.'
    : 'This action will temporarily suspend the agent. It can be resumed later.'

  return (
    <div className="card" style={{ border: `1px solid ${actionColor}30` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: actionColor + '14' }}
          >
            <AlertTriangle size={20} style={{ color: actionColor }} />
          </div>
          <div>
            <h3 className="text-base font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>{title}</h3>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{description}</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-md cursor-pointer transition-colors"
          style={{ color: '#94A3B8' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Impact analysis */}
      <div className="space-y-3 mt-5">
        <div className="p-4 rounded-lg" style={{ background: '#F7F9FC', border: '1px solid #E2E8F0' }}>
          <div className="text-xs font-semibold uppercase mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
            Impact Analysis
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: '#64748B' }}>Process task coverage</span>
              <span className="font-semibold tabular-nums" style={{ color: '#0A1628' }}>
                This agent handles {impact.taskCoveragePercent}% of {impact.processName} tasks
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span style={{ color: '#64748B' }}>Agent coverage change</span>
              <span className="flex items-center gap-2 font-semibold tabular-nums">
                <span style={{ color: '#059669' }}>{impact.currentCoverage}%</span>
                <ArrowDown size={14} style={{ color: '#DC2626' }} />
                <span style={{ color: '#DC2626' }}>{impact.newCoverage}%</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span style={{ color: '#64748B' }}>Estimated weekly ROI impact</span>
              <span className="font-bold tabular-nums" style={{ color: '#DC2626' }}>
                {impact.weeklyROIImpact > 0 ? '+' : ''}{impact.weeklyROIImpact < 0 ? '-' : ''}${Math.abs(impact.weeklyROIImpact)}/week
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span style={{ color: '#64748B' }}>Tasks will revert to</span>
              <span className="font-semibold" style={{ color: '#D97706' }}>{impact.fallbackMode}</span>
            </div>
          </div>
        </div>

        {/* Affected tasks */}
        <div className="p-4 rounded-lg" style={{ background: '#F7F9FC', border: '1px solid #E2E8F0' }}>
          <div className="text-xs font-semibold uppercase mb-2" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
            Affected Tasks
          </div>
          <div className="space-y-1.5">
            {impact.affectedTasks.map(t => (
              <div key={t.name} className="flex items-center justify-between text-sm">
                <span style={{ color: '#0A1628' }}>{t.name}</span>
                <span className="tabular-nums" style={{ color: '#64748B' }}>
                  {t.weeklyVolume} tasks/wk &middot; {t.timeWeight}% time
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={onConfirm}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors"
          style={{ background: actionColor }}
        >
          {actionLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer transition-colors"
          style={{ borderColor: '#E2E8F0', color: '#64748B' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
