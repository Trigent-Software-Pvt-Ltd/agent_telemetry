'use client'

import type { FmeaEntry } from '@/types/telemetry'
import { ShieldAlert, Info } from 'lucide-react'

interface FmeaDetailPanelProps {
  entry: FmeaEntry | null
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  open: { bg: 'var(--status-red-bg)', color: 'var(--status-red)', label: 'Open' },
  'in-progress': { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', label: 'In Progress' },
  mitigated: { bg: 'var(--status-green-bg)', color: 'var(--status-green)', label: 'Mitigated' },
}

function ScoreBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100
  const color =
    value >= 8 ? 'var(--status-red)' :
    value >= 5 ? 'var(--status-amber)' :
    'var(--status-green)'

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="rounded-full h-2" style={{ background: 'var(--surface)' }}>
        <div
          className="rounded-full h-2 transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

function rpnColor(rpn: number): string {
  if (rpn > 200) return 'var(--status-red)'
  if (rpn > 100) return 'var(--status-amber)'
  return 'var(--status-green)'
}

export function FmeaDetailPanel({ entry }: FmeaDetailPanelProps) {
  if (!entry) {
    return (
      <div className="card flex flex-col items-center justify-center" style={{ minHeight: 340 }}>
        <Info size={32} style={{ color: 'var(--text-muted)' }} />
        <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a risk item from the heatmap or table to view details
        </p>
      </div>
    )
  }

  const st = STATUS_STYLE[entry.status]

  // Mock timeline dates
  const timelines: Record<string, string[]> = {
    open: ['Identified Mar 15'],
    'in-progress': ['Identified Mar 15', 'Under review Mar 20', 'Action assigned Mar 25'],
    mitigated: ['Identified Mar 10', 'Under review Mar 14', 'Action assigned Mar 18', 'Mitigated Mar 26'],
  }
  const timeline = timelines[entry.status]

  return (
    <div className="card flex flex-col gap-4 animate-fade-up" style={{ minHeight: 340 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert size={18} style={{ color: rpnColor(entry.rpn), marginTop: 2, flexShrink: 0 }} />
          <div>
            <h3 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {entry.failureMode}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {entry.agentName}
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
          style={{ background: st.bg, color: st.color }}
        >
          {st.label}
        </span>
      </div>

      {/* Effect */}
      <div>
        <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Effect / Business Impact
        </p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.effect}</p>
      </div>

      {/* Cause */}
      <div>
        <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Root Cause
        </p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{entry.cause}</p>
      </div>

      {/* Score bars */}
      <div className="flex flex-col gap-2.5">
        <ScoreBar label="Severity" value={entry.severity} />
        <ScoreBar label="Occurrence" value={entry.occurrence} />
        <ScoreBar label="Detection" value={entry.detection} />
      </div>

      {/* RPN calculation */}
      <div
        className="rounded-lg px-4 py-3 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Risk Priority Number
        </p>
        <p className="text-lg font-bold tabular-nums" style={{ color: rpnColor(entry.rpn) }}>
          {entry.severity} <span style={{ color: 'var(--text-muted)' }}>&times;</span>{' '}
          {entry.occurrence} <span style={{ color: 'var(--text-muted)' }}>&times;</span>{' '}
          {entry.detection} <span style={{ color: 'var(--text-muted)' }}>=</span>{' '}
          {entry.rpn}
        </p>
      </div>

      {/* Recommended action */}
      <div
        className="rounded-lg px-4 py-3"
        style={{
          background: 'var(--accent-blue-bg)',
          borderLeft: '3px solid var(--accent-blue)',
        }}
      >
        <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--accent-blue)', letterSpacing: '0.05em' }}>
          Recommended Action
        </p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {entry.recommendedAction}
        </p>
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Timeline
        </p>
        <div className="flex items-center gap-1 text-xs flex-wrap">
          {timeline.map((step, i) => (
            <span key={i} className="flex items-center gap-1">
              <span
                className="rounded-full px-2 py-0.5"
                style={{
                  background: i === timeline.length - 1 ? st.bg : 'var(--surface)',
                  color: i === timeline.length - 1 ? st.color : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  fontWeight: i === timeline.length - 1 ? 600 : 400,
                }}
              >
                {step}
              </span>
              {i < timeline.length - 1 && (
                <span style={{ color: 'var(--text-muted)' }}>&rarr;</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
