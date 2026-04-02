'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import type { Run } from '@/types/telemetry'
import { getAgentById } from '@/lib/mock-data'
import { EmptyState } from '@/components/shared/EmptyState'
import FailureEscalationCard from '@/components/telemetry/FailureEscalationCard'

interface RunHistoryProps {
  runs: Run[]
  pageSize?: number
}

/** CEO-friendly one-line summary for a run */
function RunSummary({ run }: { run: Run }) {
  const stepCount = run.spans.length
  const durationSec = (run.durationMs / 1000).toFixed(1)

  if (run.outcome) {
    return (
      <p className="text-sm text-text-primary">
        This run <span className="font-semibold text-status-green">succeeded</span> in{' '}
        <span className="font-semibold tabular-nums">{durationSec}s</span>, cost{' '}
        <span className="font-semibold tabular-nums">${run.totalCost.toFixed(4)}</span>, processed{' '}
        <span className="font-semibold tabular-nums">{stepCount} step{stepCount !== 1 ? 's' : ''}</span>
      </p>
    )
  }

  // Find the failed span
  const failedSpanIdx = run.spans.findIndex(s => s.status === 'error')
  const failedSpan = failedSpanIdx >= 0 ? run.spans[failedSpanIdx] : null

  return (
    <p className="text-sm text-text-primary">
      This run{' '}
      <span className="font-semibold text-status-red">FAILED</span>
      {failedSpan ? (
        <>
          {' '}at step {failedSpanIdx + 1} &mdash;{' '}
          <span className="font-semibold">{failedSpan.name}</span>{' '}
          {failedSpan.error
            ? failedSpan.error.toLowerCase().includes('timeout')
              ? `timed out after ${(failedSpan.duration_ms / 1000).toFixed(1)}s`
              : failedSpan.error
            : `errored after ${(failedSpan.duration_ms / 1000).toFixed(1)}s`}
        </>
      ) : (
        <> after {durationSec}s</>
      )}
    </p>
  )
}

function SpanTimeline({ run }: { run: Run }) {
  const maxDuration = Math.max(...run.spans.map((s) => s.duration_ms), 1)
  const agent = getAgentById(run.agentId)

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <div className="grid grid-cols-4 gap-4 text-xs text-text-muted mb-1">
        <span>Latency</span>
        <span>Cost</span>
        <span>Model</span>
        <span>Tokens / Tool Calls</span>
      </div>
      <div className="grid grid-cols-4 gap-4 text-sm tabular-nums">
        <span>{run.durationMs.toLocaleString()}ms</span>
        <span>${run.totalCost.toFixed(4)}</span>
        <span className="text-text-secondary">{agent?.model ?? 'unknown'}</span>
        <span>{run.tokenCount.toLocaleString()} / {run.toolCalls} calls</span>
      </div>

      <div className="mt-3 space-y-1.5">
        <p className="text-xs text-text-muted uppercase tracking-wide">Span Timeline</p>
        {run.spans.map((span, i) => {
          const widthPct = Math.max(5, (span.duration_ms / maxDuration) * 100)
          const isError = span.status === 'error'
          return (
            <div key={i}>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-40 truncate">{span.name}</span>
                <div className="flex-1 h-5 bg-surface rounded overflow-hidden relative">
                  <div
                    className="span-bar h-full rounded"
                    style={{
                      '--span-width': `${widthPct}%`,
                      backgroundColor: isError ? 'var(--status-red)' : 'var(--status-green)',
                      opacity: 0.75,
                    } as React.CSSProperties}
                  />
                </div>
                <span className="text-xs tabular-nums text-text-muted w-16 text-right">
                  {span.duration_ms}ms
                </span>
                <span className="text-xs tabular-nums text-text-muted w-14 text-right">
                  {span.tool_calls} call{span.tool_calls !== 1 ? 's' : ''}
                </span>
                {isError && (
                  <span className="text-xs text-status-red">&#10005;</span>
                )}
              </div>
              {isError && span.error && (
                <div className="ml-[calc(10rem+0.75rem)] mt-1 px-2 py-1 rounded text-xs text-status-red bg-status-red/5 border border-status-red/20">
                  {span.error}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RunHistory({ runs, pageSize = 10 }: RunHistoryProps) {
  const [page, setPage] = useState(0)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)

  const totalPages = Math.ceil(runs.length / pageSize)
  const pageRuns = runs.slice(page * pageSize, (page + 1) * pageSize)

  if (!runs || runs.length === 0) {
    return (
      <div className="card animate-fade-up">
        <EmptyState
          icon={History}
          title="No runs recorded yet"
          description="Once your agent completes its first run, data will appear here."
        />
      </div>
    )
  }

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Run History
        </h3>
        <span className="text-xs text-text-muted">{runs.length} total runs</span>
      </div>

      <div className="space-y-1">
        {pageRuns.map((run) => {
          const isExpanded = expandedRun === run.runId
          const ts = new Date(run.timestamp)
          const dateStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
          const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

          return (
            <div key={run.runId}>
              <button
                onClick={() => setExpandedRun(isExpanded ? null : run.runId)}
                className="w-full flex items-center gap-4 px-3 py-2.5 rounded-lg row-hover text-left transition-colors cursor-pointer"
              >
                <span className="text-xs font-mono text-accent-blue w-24">{run.runId}</span>
                <span className="text-xs text-text-muted w-28">{dateStr} {timeStr}</span>
                <span className="text-xs tabular-nums text-text-secondary w-20">
                  {(run.durationMs / 1000).toFixed(1)}s
                </span>
                <span className="flex-1" />
                {run.outcome ? (
                  <span className="text-status-green text-sm">&#10003;</span>
                ) : (
                  <span className="text-status-red text-sm">&#10005;</span>
                )}
                <span className="text-xs text-text-muted">{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  {/* CEO summary line */}
                  <RunSummary run={run} />
                  {/* Engineer span timeline */}
                  <SpanTimeline run={run} />
                  {/* Failure escalation (only for failed runs) */}
                  {!run.outcome && (
                    <FailureEscalationCard run={run} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-xs rounded-md border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs text-text-muted tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-xs rounded-md border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
