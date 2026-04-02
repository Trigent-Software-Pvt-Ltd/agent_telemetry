'use client'

import { useState } from 'react'
import { AgentProfile } from '@/types/telemetry'
import { ArrowRightLeft, ChevronDown, X, Plus } from 'lucide-react'

interface SwapPanelProps {
  currentAgent: AgentProfile
  availableAgents: AgentProfile[]
  onConfirm: (replacementId: string | null) => void
  onCancel: () => void
}

export function SwapPanel({ currentAgent, availableAgents, onConfirm, onCancel }: SwapPanelProps) {
  const [mode, setMode] = useState<'select' | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  const selectedAgent = availableAgents.find(a => a.id === selectedAgentId)

  const metrics = [
    { label: 'Sigma Score', key: 'sigmaScore', format: (v: number) => v.toFixed(1) + 'σ', better: 'higher' },
    { label: 'Success Rate', key: 'successRate', format: (v: number) => Math.round(v * 100) + '%', better: 'higher' },
    { label: 'Avg Cost/Run', key: 'avgCostPerRun', format: (v: number) => '$' + v.toFixed(3), better: 'lower' },
    { label: 'P95 Latency', key: 'p95Latency', format: (v: number) => v + 'ms', better: 'lower' },
    { label: 'Total Runs', key: 'totalRuns', format: (v: number) => v.toLocaleString(), better: 'higher' },
    { label: 'Consistency', key: 'consistency', format: (v: number) => v + '%', better: 'higher' },
  ] as const

  const totalTasks = currentAgent.tasks.reduce((s, t) => s + t.weeklyVolume, 0)
  const totalTimeWeight = currentAgent.tasks.reduce((s, t) => s + t.timeWeight, 0)

  return (
    <div className="card" style={{ border: '1px solid #0891B230' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#0891B214' }}>
            <ArrowRightLeft size={20} style={{ color: '#0891B2' }} />
          </div>
          <div>
            <h3 className="text-base font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Replace Agent
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
              Replace {currentAgent.name} with another agent
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-1.5 rounded-md cursor-pointer" style={{ color: '#94A3B8' }}>
          <X size={18} />
        </button>
      </div>

      {/* Selection options */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => { setMode(null); setSelectedAgentId(null); onConfirm(null) }}
          className="p-4 rounded-lg border text-left cursor-pointer transition-colors row-hover"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Plus size={16} style={{ color: '#7C3AED' }} />
            <span className="text-sm font-semibold" style={{ color: '#0A1628' }}>New Agent</span>
          </div>
          <span className="text-xs" style={{ color: '#64748B' }}>Deploy a new agent (not yet configured)</span>
        </button>

        <button
          onClick={() => setMode('select')}
          className="p-4 rounded-lg border text-left cursor-pointer transition-colors row-hover"
          style={{ borderColor: mode === 'select' ? '#0891B2' : '#E2E8F0', background: mode === 'select' ? '#0891B208' : 'transparent' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft size={16} style={{ color: '#0891B2' }} />
            <span className="text-sm font-semibold" style={{ color: '#0A1628' }}>Existing Agent</span>
          </div>
          <span className="text-xs" style={{ color: '#64748B' }}>Select from agents in this process</span>
        </button>
      </div>

      {/* Agent selector */}
      {mode === 'select' && (
        <div className="mb-5">
          <label className="text-xs font-semibold uppercase mb-2 block" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
            Select Replacement Agent
          </label>
          <div className="space-y-2">
            {availableAgents.map(a => (
              <button
                key={a.id}
                onClick={() => setSelectedAgentId(a.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-colors row-hover"
                style={{
                  borderColor: selectedAgentId === a.id ? '#0891B2' : '#E2E8F0',
                  background: selectedAgentId === a.id ? '#0891B208' : 'transparent',
                }}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>{a.name}</div>
                  <div className="text-xs" style={{ color: '#64748B' }}>
                    {a.sigmaScore.toFixed(1)}σ &middot; {Math.round(a.successRate * 100)}% success
                  </div>
                </div>
                <span className="text-xs tabular-nums" style={{ color: '#64748B' }}>${a.avgCostPerRun.toFixed(3)}/run</span>
              </button>
            ))}
            {availableAgents.length === 0 && (
              <div className="text-sm text-center py-4" style={{ color: '#94A3B8' }}>
                No other agents available in this process
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comparison table */}
      {selectedAgent && (
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase mb-3" style={{ color: '#64748B', letterSpacing: '0.05em' }}>
            Impact Comparison
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#F7F9FC', borderBottom: '1px solid #E2E8F0' }}>
                  <th className="text-left px-4 py-2.5 font-medium" style={{ color: '#64748B' }}>Metric</th>
                  <th className="text-right px-4 py-2.5 font-medium" style={{ color: '#DC2626' }}>Current</th>
                  <th className="text-right px-4 py-2.5 font-medium" style={{ color: '#059669' }}>Replacement</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => {
                  const oldVal = currentAgent[m.key] as number
                  const newVal = selectedAgent[m.key] as number
                  const isBetter = m.better === 'higher' ? newVal > oldVal : newVal < oldVal
                  return (
                    <tr key={m.key} className="row-hover" style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td className="px-4 py-2.5" style={{ color: '#0A1628' }}>{m.label}</td>
                      <td className="text-right px-4 py-2.5 tabular-nums" style={{ color: '#64748B' }}>
                        {m.format(oldVal)}
                      </td>
                      <td className="text-right px-4 py-2.5 font-semibold tabular-nums" style={{ color: isBetter ? '#059669' : '#DC2626' }}>
                        {m.format(newVal)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-sm" style={{ color: '#64748B' }}>
            This swap will affect <strong style={{ color: '#0A1628' }}>{totalTasks} tasks</strong> covering{' '}
            <strong style={{ color: '#0A1628' }}>{totalTimeWeight}%</strong> of role time.
          </div>
        </div>
      )}

      {/* Actions */}
      {(mode === 'select' && selectedAgent) && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onConfirm(selectedAgentId)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ background: '#0891B2' }}
          >
            Confirm Replacement
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
