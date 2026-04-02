'use client'

import { useState } from 'react'
import type { CoverageMapEntry, Agent } from '@/types/telemetry'
import { SigmaTooltip } from '@/components/shared/SigmaTooltip'
import { CoverageSummaryBar } from './CoverageSummaryBar'
import { TaskDetailPanel } from './TaskDetailPanel'

interface CoverageGridProps {
  entries: CoverageMapEntry[]
  agents: Agent[]
  processName: string
}

const ownershipStyles: Record<string, { border: string; bg: string; pill: string; pillText: string }> = {
  agent: {
    border: 'var(--status-green)',
    bg: 'var(--status-green-bg)',
    pill: 'var(--status-green)',
    pillText: '#FFFFFF',
  },
  collaborative: {
    border: 'var(--status-amber)',
    bg: 'var(--status-amber-bg)',
    pill: 'var(--status-amber)',
    pillText: '#FFFFFF',
  },
  human: {
    border: 'var(--text-muted)',
    bg: 'var(--surface)',
    pill: 'var(--text-muted)',
    pillText: '#FFFFFF',
  },
}

const confidenceColors: Record<string, string> = {
  high: 'var(--status-green)',
  medium: 'var(--status-amber)',
  low: 'var(--status-red)',
}

export function CoverageGrid({ entries, agents, processName }: CoverageGridProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const selectedEntry = entries.find((e) => e.taskId === selectedTaskId) ?? null
  const selectedAgent = selectedEntry?.agentId
    ? agents.find((a) => a.id === selectedEntry.agentId) ?? null
    : null

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>
          Task Assignment &mdash; {processName}
        </h1>
        <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
          Click any task to see detailed ownership analysis
        </p>
      </div>

      {/* Summary bar */}
      <CoverageSummaryBar entries={entries} />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry) => {
          const style = ownershipStyles[entry.ownership]
          const isSelected = entry.taskId === selectedTaskId
          const agent = entry.agentId ? agents.find((a) => a.id === entry.agentId) : null

          return (
            <button
              key={entry.taskId}
              type="button"
              onClick={() =>
                setSelectedTaskId(isSelected ? null : entry.taskId)
              }
              className="card text-left cursor-pointer transition-all"
              style={{
                borderColor: isSelected ? style.border : 'var(--border)',
                borderWidth: isSelected ? 2 : 1,
                backgroundColor: isSelected ? style.bg : '#FFFFFF',
              }}
            >
              {/* Task name */}
              <p
                className="text-sm font-semibold leading-tight mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {entry.task}
              </p>

              {/* Time weight */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-secondary">
                  Time weight: <span className="font-bold tabular-nums">{Math.round(entry.timeWeight * 100)}%</span>
                </span>
                {/* Confidence badge */}
                <span
                  className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                  style={{
                    color: confidenceColors[entry.confidence],
                    backgroundColor: entry.confidence === 'high'
                      ? 'var(--status-green-bg)'
                      : entry.confidence === 'medium'
                        ? 'var(--status-amber-bg)'
                        : 'var(--status-red-bg)',
                  }}
                >
                  {entry.confidence}
                </span>
              </div>

              {/* Ownership pill */}
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{
                    backgroundColor: style.pill,
                    color: style.pillText,
                  }}
                >
                  {entry.ownership}
                </span>

                {/* Agent info for agent-owned tasks */}
                {entry.ownership === 'agent' && agent && (
                  <span className="text-[11px] text-text-secondary flex items-center gap-1">
                    {agent.name}
                    <SigmaTooltip value={agent.sigmaScore}>
                      <span
                        className="font-bold tabular-nums"
                        style={{
                          color: agent.sigmaScore >= 4.0
                            ? 'var(--status-green)'
                            : agent.sigmaScore >= 3.0
                              ? 'var(--status-amber)'
                              : 'var(--status-red)',
                        }}
                      >
                        {agent.sigmaScore.toFixed(1)}&sigma;
                      </span>
                    </SigmaTooltip>
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {selectedEntry && (
        <TaskDetailPanel
          entry={selectedEntry}
          agent={selectedAgent}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  )
}
