'use client'

import type { TaskPerformanceMetric } from '@/lib/mock-data'
import { Award, Clock, DollarSign, CheckCircle } from 'lucide-react'

interface TaskPerformanceOverlayProps {
  perf: TaskPerformanceMetric
}

export function TaskPerformanceOverlay({ perf }: TaskPerformanceOverlayProps) {
  if (perf.ownership === 'human' || perf.totalRuns === 0) return null

  const successColor =
    perf.successRate >= 0.85
      ? 'var(--status-green)'
      : perf.successRate >= 0.70
        ? 'var(--status-amber)'
        : 'var(--status-red)'

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
      {/* Next best candidate badge */}
      {perf.nextBestCandidate && (
        <div
          className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            color: '#92400E',
            border: '1px solid #F59E0B',
          }}
        >
          <Award size={12} />
          Next best task to automate
        </div>
      )}

      {/* Metrics row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <CheckCircle size={11} style={{ color: successColor }} />
          <span className="text-[11px] tabular-nums" style={{ color: successColor }}>
            <span className="font-bold">{Math.round(perf.successRate * 100)}%</span>
            <span style={{ color: 'var(--text-muted)' }}> success</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {perf.avgLatencyMs >= 1000
              ? `${(perf.avgLatencyMs / 1000).toFixed(1)}s`
              : `${perf.avgLatencyMs}ms`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            ${perf.avgCostPerRun.toFixed(2)}/run
          </span>
        </div>
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
          ({perf.totalRuns.toLocaleString()} runs)
        </span>
      </div>
    </div>
  )
}
