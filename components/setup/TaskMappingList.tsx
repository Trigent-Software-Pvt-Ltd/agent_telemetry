'use client'

import { ChevronDown } from 'lucide-react'
import type { Ownership } from '@/types/telemetry'

export interface TaskAssignment {
  taskId: string
  task: string
  timeWeight: number
  automationScore: number
  ownership: Ownership
  agentId: string | null
  agentName: string | null
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

interface AgentOption {
  id: string
  name: string
}

interface TaskMappingListProps {
  assignments: TaskAssignment[]
  agents: AgentOption[]
  onOwnershipChange: (taskId: string, ownership: Ownership) => void
  onAgentChange: (taskId: string, agentId: string, agentName: string) => void
  onConfidenceChange: (taskId: string, confidence: 'high' | 'medium' | 'low') => void
  onNotesChange: (taskId: string, notes: string) => void
}

const ownershipOptions: { value: Ownership; label: string; color: string; bg: string }[] = [
  { value: 'agent', label: 'Agent', color: 'var(--status-green)', bg: 'var(--status-green-bg)' },
  { value: 'collaborative', label: 'Collaborative', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)' },
  { value: 'human', label: 'Human', color: 'var(--text-secondary)', bg: 'var(--surface)' },
]

const confidenceLevels: { value: 'high' | 'medium' | 'low'; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export function TaskMappingList({
  assignments,
  agents,
  onOwnershipChange,
  onAgentChange,
  onConfidenceChange,
  onNotesChange,
}: TaskMappingListProps) {
  return (
    <div className="flex flex-col gap-2">
      {assignments.map((task, idx) => (
        <div
          key={task.taskId}
          className="card"
          style={{
            background: idx % 2 === 0 ? 'var(--content-bg)' : 'var(--surface)',
          }}
        >
          {/* Task header row */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {task.task}
                </span>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--accent-blue-bg)',
                    color: 'var(--accent-blue)',
                  }}
                >
                  {(task.timeWeight * 100).toFixed(0)}% of role
                </span>
              </div>

              {/* Automation score bar */}
              <div className="flex items-center gap-2">
                <div
                  className="h-1.5 rounded-full flex-1"
                  style={{ background: 'var(--border)', maxWidth: 200 }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${task.automationScore * 100}%`,
                      background: `linear-gradient(90deg, var(--status-green) 0%, #34d399 100%)`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {(task.automationScore * 100).toFixed(0)}% automatable
                </span>
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4 flex-wrap mt-3">
            {/* Segmented ownership control */}
            <div
              className="inline-flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              {ownershipOptions.map((opt) => {
                const isActive = task.ownership === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => onOwnershipChange(task.taskId, opt.value)}
                    className="px-3 py-1.5 text-xs font-medium transition-all"
                    style={{
                      background: isActive ? opt.bg : 'var(--content-bg)',
                      color: isActive ? opt.color : 'var(--text-muted)',
                      borderRight: opt.value !== 'human' ? '1px solid var(--border)' : 'none',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Agent dropdown — only shown when ownership is 'agent' */}
            {task.ownership === 'agent' && (
              <div className="relative">
                <select
                  value={task.agentId || ''}
                  onChange={(e) => {
                    const agent = agents.find((a) => a.id === e.target.value)
                    if (agent) onAgentChange(task.taskId, agent.id, agent.name)
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    border: '1px solid var(--status-green)',
                    background: 'var(--status-green-bg)',
                    color: 'var(--status-green)',
                    minWidth: 180,
                  }}
                >
                  <option value="">Select agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--status-green)' }}
                />
              </div>
            )}

            {/* Confidence pills */}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs mr-1" style={{ color: 'var(--text-muted)' }}>Confidence:</span>
              {confidenceLevels.map((level) => {
                const isActive = task.confidence === level.value
                const pillColor =
                  level.value === 'high'
                    ? 'var(--status-green)'
                    : level.value === 'medium'
                      ? 'var(--status-amber)'
                      : 'var(--status-red)'
                return (
                  <button
                    key={level.value}
                    onClick={() => onConfidenceChange(task.taskId, level.value)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: isActive ? pillColor : 'transparent',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      border: `1px solid ${isActive ? pillColor : 'var(--border)'}`,
                    }}
                  >
                    {level.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes row */}
          <div className="mt-3">
            <input
              type="text"
              value={task.notes}
              onChange={(e) => onNotesChange(task.taskId, e.target.value)}
              placeholder="Add notes about this assignment..."
              className="w-full px-3 py-1.5 rounded-lg text-xs"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-secondary)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
