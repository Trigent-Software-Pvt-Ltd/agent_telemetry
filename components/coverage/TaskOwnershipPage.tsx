'use client'

import { useState } from 'react'
import type { CoverageMapEntry, Agent, Process, OnetTask } from '@/types/telemetry'
import { CoverageSummaryBar } from './CoverageSummaryBar'
import { TaskDetailPanel } from './TaskDetailPanel'
import TaskBoard from '@/components/labor/TaskBoard'
import SkillsPanel from '@/components/labor/SkillsPanel'
import { LayoutGrid, List } from 'lucide-react'

type ViewMode = 'card' | 'list'

interface TaskOwnershipPageProps {
  entries: CoverageMapEntry[]
  agents: Agent[]
  tasks: OnetTask[]
  process: Process
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

export function TaskOwnershipPage({ entries, agents, tasks, process }: TaskOwnershipPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const selectedEntry = entries.find((e) => e.taskId === selectedTaskId) ?? null
  const selectedAgent = selectedEntry?.agentId
    ? agents.find((a) => a.id === selectedEntry.agentId) ?? null
    : null

  const views: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'card', label: 'Card View', icon: LayoutGrid },
    { id: 'list', label: 'List View', icon: List },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}>
            Task Ownership &mdash; {process.name}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {viewMode === 'card'
              ? 'Click any task to see detailed ownership analysis'
              : 'Three-column task allocation view'}
          </p>
        </div>

        {/* View toggle */}
        <div
          className="inline-flex rounded-lg p-1"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {views.map((v) => {
            const Icon = v.icon
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: viewMode === v.id ? '#FFFFFF' : 'transparent',
                  color: viewMode === v.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: viewMode === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <Icon size={14} />
                {v.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Coverage summary bar (shared) */}
      <CoverageSummaryBar entries={entries} />

      {/* View content */}
      {viewMode === 'card' ? (
        <>
          {/* Card View — CoverageGrid content */}
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
        </>
      ) : (
        /* List View — TaskBoard content */
        <TaskBoard tasks={tasks} />
      )}

      {/* Skills panel (shared, from Labor Graph) */}
      <SkillsPanel />
    </div>
  )
}
