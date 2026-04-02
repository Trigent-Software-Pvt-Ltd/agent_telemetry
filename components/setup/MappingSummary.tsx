'use client'

import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { TaskAssignment } from './TaskMappingList'

interface MappingSummaryProps {
  assignments: TaskAssignment[]
}

export function MappingSummary({ assignments }: MappingSummaryProps) {
  // Calculate coverage percentages from time weights
  const agentPct = assignments
    .filter((t) => t.ownership === 'agent')
    .reduce((sum, t) => sum + t.timeWeight, 0)
  const collabPct = assignments
    .filter((t) => t.ownership === 'collaborative')
    .reduce((sum, t) => sum + t.timeWeight, 0)
  const humanPct = assignments
    .filter((t) => t.ownership === 'human')
    .reduce((sum, t) => sum + t.timeWeight, 0)

  const totalAssigned = assignments.filter((t) => {
    if (t.ownership === 'agent') return !!t.agentId
    return true
  }).length

  const totalCoverage = agentPct + collabPct + humanPct
  const estimatedRoiImpact = Math.round(agentPct * 3300 + collabPct * 1200)

  const handleSave = () => {
    toast.success('Mapping saved successfully')
  }

  return (
    <div className="card flex flex-col gap-5" style={{ position: 'sticky', top: 88 }}>
      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
        Coverage Summary
      </h3>

      {/* Horizontal coverage bar */}
      <div>
        <div className="flex rounded-lg overflow-hidden h-6" style={{ border: '1px solid var(--border)' }}>
          {agentPct > 0 && (
            <div
              className="flex items-center justify-center text-xs font-semibold transition-all duration-300"
              style={{
                width: `${(agentPct / totalCoverage) * 100}%`,
                background: 'var(--status-green)',
                color: '#fff',
                minWidth: agentPct > 0.05 ? 40 : 0,
              }}
            >
              {(agentPct * 100).toFixed(0)}%
            </div>
          )}
          {collabPct > 0 && (
            <div
              className="flex items-center justify-center text-xs font-semibold transition-all duration-300"
              style={{
                width: `${(collabPct / totalCoverage) * 100}%`,
                background: 'var(--status-amber)',
                color: '#fff',
                minWidth: collabPct > 0.05 ? 40 : 0,
              }}
            >
              {(collabPct * 100).toFixed(0)}%
            </div>
          )}
          {humanPct > 0 && (
            <div
              className="flex items-center justify-center text-xs font-semibold transition-all duration-300"
              style={{
                width: `${(humanPct / totalCoverage) * 100}%`,
                background: '#d1d5db',
                color: 'var(--text-secondary)',
                minWidth: humanPct > 0.05 ? 40 : 0,
              }}
            >
              {(humanPct * 100).toFixed(0)}%
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--status-green)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'var(--status-amber)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collaborative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#d1d5db' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Human</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Tasks assigned</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {totalAssigned} / {assignments.length}
          </span>
        </div>
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total coverage</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {(totalCoverage * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Agent coverage</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--status-green)' }}>
            {(agentPct * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Collaborative</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--status-amber)' }}>
            {(collabPct * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Human retained</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {(humanPct * 100).toFixed(0)}%
          </span>
        </div>
        <div
          className="flex justify-between items-center pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Est. weekly ROI impact</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
            ${estimatedRoiImpact.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: 'var(--status-green)',
            color: '#fff',
          }}
        >
          <Save size={16} />
          Save mapping
        </button>
        <Link
          href="/setup/occupation"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-xs font-medium transition-all"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            background: 'var(--content-bg)',
          }}
        >
          <ArrowLeft size={14} />
          Back to occupation setup
        </Link>
      </div>
    </div>
  )
}
