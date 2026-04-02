'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { TaskMappingList } from '@/components/setup/TaskMappingList'
import type { TaskAssignment } from '@/components/setup/TaskMappingList'
import { MappingSummary } from '@/components/setup/MappingSummary'
import { COVERAGE_MAP, AGENTS, PROCESSES } from '@/lib/mock-data'
import type { Ownership } from '@/types/telemetry'

const PROCESS_OPTIONS = PROCESSES.map((p) => ({
  id: p.id,
  name: p.name,
}))

export default function MappingPage() {
  const [selectedProcessId, setSelectedProcessId] = useState('sports-betting')

  const selectedProcess = PROCESSES.find((p) => p.id === selectedProcessId)!

  // Build initial assignments from COVERAGE_MAP
  const initialAssignments: TaskAssignment[] = useMemo(
    () =>
      COVERAGE_MAP.map((entry) => ({
        taskId: entry.taskId,
        task: entry.task,
        timeWeight: entry.timeWeight,
        automationScore: entry.automationScore,
        ownership: entry.ownership,
        agentId: entry.agentId,
        agentName: entry.agentName,
        confidence: entry.confidence,
        notes: entry.notes,
      })),
    []
  )

  const [assignments, setAssignments] = useState<TaskAssignment[]>(initialAssignments)

  // Available agents for the selected process
  const availableAgents = useMemo(
    () =>
      AGENTS.filter((a) => a.processId === selectedProcessId).map((a) => ({
        id: a.id,
        name: a.name,
      })),
    [selectedProcessId]
  )

  const handleOwnershipChange = useCallback((taskId: string, ownership: Ownership) => {
    setAssignments((prev) =>
      prev.map((t) => {
        if (t.taskId !== taskId) return t
        // If switching away from agent, clear agent assignment
        if (ownership !== 'agent') {
          return { ...t, ownership, agentId: null, agentName: null }
        }
        return { ...t, ownership }
      })
    )
  }, [])

  const handleAgentChange = useCallback((taskId: string, agentId: string, agentName: string) => {
    setAssignments((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, agentId, agentName } : t))
    )
  }, [])

  const handleConfidenceChange = useCallback(
    (taskId: string, confidence: 'high' | 'medium' | 'low') => {
      setAssignments((prev) =>
        prev.map((t) => (t.taskId === taskId ? { ...t, confidence } : t))
      )
    },
    []
  )

  const handleNotesChange = useCallback((taskId: string, notes: string) => {
    setAssignments((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, notes } : t))
    )
  }, [])

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Map Agents to Tasks — {selectedProcess.name}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Assign each task to an agent, mark as collaborative, or retain for humans
        </p>
      </div>

      {/* Process selector */}
      <div className="mb-6">
        <div className="relative inline-block">
          <select
            value={selectedProcessId}
            onChange={(e) => setSelectedProcessId(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--content-bg)',
              color: 'var(--text-primary)',
              minWidth: 260,
            }}
          >
            {PROCESS_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '7fr 3fr', alignItems: 'start' }}>
        {/* Left: Task list */}
        <TaskMappingList
          assignments={assignments}
          agents={availableAgents}
          onOwnershipChange={handleOwnershipChange}
          onAgentChange={handleAgentChange}
          onConfidenceChange={handleConfidenceChange}
          onNotesChange={handleNotesChange}
        />

        {/* Right: Summary sidebar */}
        <MappingSummary assignments={assignments} />
      </div>
    </div>
  )
}
