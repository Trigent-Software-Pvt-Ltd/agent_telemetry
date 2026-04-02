'use client'

import { AUDIT_LOG } from '@/lib/mock-data'
import type { DecisionType } from '@/types/telemetry'

const pillStyles: Record<DecisionType, { bg: string; color: string; label: string }> = {
  approved:   { bg: 'var(--status-green-bg)', color: 'var(--status-green)', label: 'APPROVED' },
  overridden: { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', label: 'OVERRIDDEN' },
  escalated:  { bg: 'var(--status-red-bg)',   color: 'var(--status-red)',   label: 'ESCALATED' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AuditTable() {
  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              {['Date / Time', 'Process', 'Task', 'Agent recommendation', 'Human decision', 'Reviewer', 'Decision', 'Duration'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: '#64748B' }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {AUDIT_LOG.map((entry) => {
              const pill = pillStyles[entry.decisionType]
              return (
                <tr
                  key={entry.id}
                  className="row-hover"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(entry.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.processName}</td>
                  <td className="px-4 py-3 max-w-[180px] truncate">{entry.task}</td>
                  <td className="px-4 py-3 max-w-[220px]" style={{ color: 'var(--text-secondary)' }}>
                    {entry.agentRecommendation}
                  </td>
                  <td className="px-4 py-3 max-w-[240px]">{entry.humanDecision}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.reviewer}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: pill.bg, color: pill.color }}
                    >
                      {pill.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                    {entry.durationMinutes} min
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
