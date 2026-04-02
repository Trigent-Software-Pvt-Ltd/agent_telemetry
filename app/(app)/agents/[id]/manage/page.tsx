'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { getAgentProfile, getAgentsByWorkflow, getDecommissionImpact, getAgentVersions } from '@/lib/mock-data'
import { AgentActions } from '@/components/telemetry/AgentActions'
import { DecommissionPanel } from '@/components/telemetry/DecommissionPanel'
import { SwapPanel } from '@/components/telemetry/SwapPanel'
import { MaintenanceScheduler } from '@/components/telemetry/MaintenanceScheduler'
import { VersionTimeline } from '@/components/telemetry/VersionTimeline'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'

type ActivePanel = 'none' | 'decommission' | 'pause' | 'reassign' | 'swap'

export default function AgentManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentProfile(id)
  if (!agent) notFound()

  const [activePanel, setActivePanel] = useState<ActivePanel>('none')
  const [agentStatus, setAgentStatus] = useState(agent.status)

  const impact = getDecommissionImpact(id)
  const processAgents = getAgentsByWorkflow(agent.workflowId).filter(a => a.id !== id)
  const versions = getAgentVersions(id)

  function handleDecommission() {
    setAgentStatus('decommissioned')
    setActivePanel('none')
    toast.success('Agent decommissioned', {
      description: `${agent!.name} has been removed from the ${agent!.processName} workflow. Tasks reverted to manual handling.`,
    })
  }

  function handlePause() {
    const newStatus = agentStatus === 'paused' ? 'active' : 'paused'
    setAgentStatus(newStatus)
    setActivePanel('none')
    toast.success(newStatus === 'paused' ? 'Agent paused' : 'Agent resumed', {
      description: newStatus === 'paused'
        ? `${agent!.name} has been paused. Tasks will queue until resumed.`
        : `${agent!.name} is now active and processing tasks.`,
    })
  }

  function handleReassign() {
    setActivePanel('none')
    toast.success('Tasks reassigned', {
      description: `${agent!.tasks.length} task types have been reassigned to collaborative mode.`,
    })
  }

  function handleSwapConfirm(replacementId: string | null) {
    setActivePanel('none')
    if (replacementId) {
      const replacement = getAgentProfile(replacementId)
      toast.success('Agent replaced successfully', {
        description: `${agent!.name} has been replaced with ${replacement?.name ?? 'a new agent'}.`,
      })
    } else {
      toast.success('Replacement queued', {
        description: `A new agent placeholder has been created to replace ${agent!.name}. Configuration required.`,
      })
    }
  }

  // Override agent status for display
  const displayAgent = { ...agent, status: agentStatus }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with actions */}
      <div className="card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/agents/${id}`}
                className="p-2 rounded-lg border cursor-pointer transition-colors"
                style={{ borderColor: '#E2E8F0', color: '#64748B' }}
              >
                <ArrowLeft size={18} />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-[var(--font-sora)]"
                style={{ background: '#D4AF3714', color: '#D4AF37' }}
              >
                {agent.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                  Manage: {agent.name}
                </h1>
                <div className="text-sm mt-0.5" style={{ color: '#64748B' }}>
                  {agent.processName} &middot; Status: <span className="capitalize font-medium">{agentStatus}</span>
                </div>
              </div>
            </div>
            <AgentActions
              onDecommission={() => setActivePanel('decommission')}
              onPause={() => {
                if (agentStatus === 'paused') {
                  handlePause()
                } else {
                  setActivePanel('pause')
                }
              }}
              onReassign={() => setActivePanel('reassign')}
              agentStatus={agentStatus}
            />
          </div>

          {/* Panels */}
          <div className="mt-6 space-y-6">
            {/* Decommission panel */}
            {activePanel === 'decommission' && impact && (
              <DecommissionPanel
                impact={impact}
                mode="decommission"
                onConfirm={handleDecommission}
                onCancel={() => setActivePanel('none')}
              />
            )}

            {/* Pause panel */}
            {activePanel === 'pause' && impact && (
              <DecommissionPanel
                impact={impact}
                mode="pause"
                onConfirm={handlePause}
                onCancel={() => setActivePanel('none')}
              />
            )}

            {/* Reassign panel */}
            {activePanel === 'reassign' && (
              <div className="card" style={{ border: '1px solid #0891B230' }}>
                <h3 className="text-base font-bold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
                  Reassign Tasks
                </h3>
                <p className="text-sm mb-4" style={{ color: '#64748B' }}>
                  Select tasks to reassign to another agent or to human review.
                </p>
                <div className="space-y-2 mb-5">
                  {agent.tasks.map(t => (
                    <label
                      key={t.name}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer row-hover"
                      style={{ borderColor: '#E2E8F0' }}
                    >
                      <input type="checkbox" defaultChecked className="accent-[#0891B2]" />
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: '#0A1628' }}>{t.name}</div>
                        <div className="text-xs" style={{ color: '#64748B' }}>
                          {t.weeklyVolume} tasks/wk &middot; {t.timeWeight}% time
                        </div>
                      </div>
                      <select
                        className="text-xs px-2 py-1 rounded border appearance-none cursor-pointer"
                        style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                        defaultValue="human"
                      >
                        <option value="human">Human Review</option>
                        {processAgents.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReassign}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
                    style={{ background: '#0891B2' }}
                  >
                    Confirm Reassignment
                  </button>
                  <button
                    onClick={() => setActivePanel('none')}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium border cursor-pointer"
                    style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Swap panel */}
            {activePanel === 'swap' && (
              <SwapPanel
                currentAgent={agent}
                availableAgents={processAgents}
                onConfirm={handleSwapConfirm}
                onCancel={() => setActivePanel('none')}
              />
            )}

            {/* Replace Agent section (always visible) */}
            {activePanel === 'none' && (
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#0891B214' }}>
                      <ArrowRightLeft size={20} style={{ color: '#0891B2' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                        Replace Agent
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                        Swap this agent with a new or existing agent in the same process
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePanel('swap')}
                    className="px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors row-hover"
                    style={{ borderColor: '#E2E8F0', color: '#0891B2' }}
                  >
                    Start Replacement
                  </button>
                </div>
              </div>
            )}

            {/* Quick stats */}
            {activePanel === 'none' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                  <div className="text-xs font-medium" style={{ color: '#64748B' }}>Weekly ROI</div>
                  <div className="text-lg font-bold font-[var(--font-sora)] tabular-nums mt-1" style={{ color: '#059669' }}>
                    ${agent.weeklyROI}/wk
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs font-medium" style={{ color: '#64748B' }}>Tasks Managed</div>
                  <div className="text-lg font-bold font-[var(--font-sora)] tabular-nums mt-1" style={{ color: '#0A1628' }}>
                    {agent.tasks.length} types
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs font-medium" style={{ color: '#64748B' }}>Weekly Volume</div>
                  <div className="text-lg font-bold font-[var(--font-sora)] tabular-nums mt-1" style={{ color: '#0A1628' }}>
                    {agent.tasks.reduce((s, t) => s + t.weeklyVolume, 0).toLocaleString()}
                  </div>
                </div>
                <div className="card">
                  <div className="text-xs font-medium" style={{ color: '#64748B' }}>Consistency</div>
                  <div className="text-lg font-bold font-[var(--font-sora)] tabular-nums mt-1" style={{ color: agent.consistency >= 80 ? '#059669' : '#D97706' }}>
                    {agent.consistency}%
                  </div>
                </div>
              </div>
            )}

            {/* Maintenance Scheduler */}
            {activePanel === 'none' && (
              <MaintenanceScheduler agentName={agent.name} />
            )}

            {/* Version Timeline with Rollback */}
            {activePanel === 'none' && versions.length > 0 && (
              <VersionTimeline versions={versions} />
            )}
          </div>
    </div>
  )
}
