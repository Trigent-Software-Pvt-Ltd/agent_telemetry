'use client'

import { useState } from 'react'
import { Run, Span } from '@/types/telemetry'
import { StatusDot } from '@/components/shared/StatusDot'
import { CheckCircle, XCircle, ChevronDown, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

interface TraceViewerProps {
  runs: Run[]
  sla_ms: number
}

export function TraceViewer({ runs, sla_ms }: TraceViewerProps) {
  const [selectedRunId, setSelectedRunId] = useState(runs[0]?.run_id)
  const selectedRun = runs.find(r => r.run_id === selectedRunId) || runs[0]

  if (!selectedRun) return null

  const totalDuration = selectedRun.spans.reduce((s, sp) => s + sp.duration_ms, 0)
  let cumulativeOffset = 0

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex" style={{ minHeight: 500 }}>
        {/* Left panel: run list */}
        <div className="w-[40%] border-r overflow-y-auto" style={{ borderColor: '#E2E8F0', maxHeight: 600 }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Run History
            </h3>
          </div>
          {runs.slice(0, 20).map(run => (
            <button
              key={run.run_id}
              onClick={() => setSelectedRunId(run.run_id)}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-3 text-left transition-colors cursor-pointer',
                run.run_id === selectedRunId ? 'bg-[#FBF5DC]' : 'row-hover'
              )}
              style={{
                borderBottom: '1px solid #E2E8F0',
                borderLeft: run.run_id === selectedRunId ? '3px solid #D4AF37' : '3px solid transparent',
              }}
            >
              <div>
                <div className="text-xs font-medium font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
                  {run.run_id}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#94A3B8' }}>
                  {new Date(run.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-[var(--font-mono-jb)]" style={{ color: run.duration_ms <= sla_ms ? '#059669' : '#DC2626' }}>
                  {run.duration_ms}ms
                </span>
                {run.outcome ? (
                  <CheckCircle size={14} style={{ color: '#059669' }} />
                ) : (
                  <XCircle size={14} style={{ color: '#DC2626' }} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Right panel: trace detail */}
        <div className="w-[60%] p-5 overflow-y-auto" style={{ maxHeight: 600 }}>
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
              {selectedRun.run_id}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                `Latency: ${(selectedRun.duration_ms / 1000).toFixed(2)}s`,
                `$${selectedRun.total_cost.toFixed(6)}`,
                selectedRun.model,
                selectedRun.framework,
                `${selectedRun.token_count} tokens`,
                `${selectedRun.tool_calls} tool calls`,
              ].map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[10px] font-medium font-[var(--font-mono-jb)]"
                  style={{ background: '#F7F9FC', color: '#64748B', border: '1px solid #E2E8F0' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Span tree */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Span Tree
            </h4>
            {selectedRun.spans.map((span, i) => (
              <div key={i} className="mb-2" style={{ paddingLeft: i * 20 }}>
                <div className="flex items-center gap-2">
                  <ChevronDown size={12} style={{ color: '#94A3B8' }} />
                  <StatusDot status={span.status === 'ok' ? 'green' : 'red'} size={8} />
                  <span className="text-sm font-medium font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
                    {span.name}
                  </span>
                  <span className="text-xs font-[var(--font-mono-jb)]" style={{ color: '#64748B' }}>
                    {span.duration_ms}ms
                  </span>
                  <span className="text-xs font-[var(--font-mono-jb)]" style={{ color: '#64748B' }}>
                    ${span.cost.toFixed(6)}
                  </span>
                  <span className="text-xs" style={{ color: '#94A3B8' }}>
                    {span.tool_calls} tools
                  </span>
                </div>
                {span.error && (
                  <div className="flex items-start gap-1.5 mt-1" style={{ paddingLeft: 22 }}>
                    <AlertTriangle size={12} style={{ color: '#DC2626', marginTop: 2 }} />
                    <span className="text-xs" style={{ color: '#DC2626' }}>{span.error}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Gantt chart */}
          <div>
            <h4 className="text-xs font-semibold uppercase mb-3" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Timeline
            </h4>
            {/* Time ruler */}
            <div className="flex justify-between text-[9px] mb-1 font-[var(--font-mono-jb)]" style={{ color: '#94A3B8' }}>
              <span>0ms</span>
              <span>{Math.round(totalDuration / 3)}ms</span>
              <span>{Math.round(totalDuration * 2 / 3)}ms</span>
              <span>{totalDuration}ms</span>
            </div>
            <div className="relative" style={{ borderTop: '1px solid #E2E8F0' }}>
              {selectedRun.spans.map((span, i) => {
                const width = (span.duration_ms / totalDuration) * 100
                const offset = cumulativeOffset
                cumulativeOffset += span.duration_ms
                const offsetPct = (offset / totalDuration) * 100
                const barColor = span.status === 'ok' ? '#0891B2' : '#DC2626'

                return (
                  <div key={i} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <div className="w-32 text-xs font-[var(--font-mono-jb)] shrink-0 truncate" style={{ color: '#64748B' }}>
                      {span.name.replace('Agent', '')}
                    </div>
                    <div className="flex-1 relative h-6 bg-[#F7F9FC] rounded">
                      <div
                        className="absolute top-0 h-full rounded span-bar"
                        style={{
                          left: `${offsetPct}%`,
                          '--span-width': `${width}%`,
                          background: barColor,
                          opacity: 0.8,
                          animationDelay: `${i * 50}ms`,
                        } as React.CSSProperties}
                      />
                    </div>
                    <span className="text-xs font-[var(--font-mono-jb)] shrink-0 w-16 text-right" style={{ color: '#64748B' }}>
                      {span.duration_ms}ms
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
