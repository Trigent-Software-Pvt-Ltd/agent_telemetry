'use client'

import { AgentStatus, AGENTS, PROCESSES } from '@/lib/mock-data'
import { SigmaTooltip } from '@/components/shared/SigmaTooltip'
import { Bot } from 'lucide-react'

interface Props {
  agents: AgentStatus[]
}

// Map agent IDs to their process names (T5)
function getProcessName(agentId: string): string {
  const agent = AGENTS.find(a => a.id === agentId)
  if (!agent) return ''
  const process = PROCESSES.find(p => p.id === agent.processId)
  return process?.name ?? ''
}

const statusDotClass: Record<string, string> = {
  active: 'status-dot-green',
  degraded: 'status-dot-amber',
  down: 'status-dot-red',
}

const statusDotColor: Record<string, string> = {
  active: '#059669',
  degraded: '#D97706',
  down: '#DC2626',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export function AgentStatusGrid({ agents }: Props) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase mb-3" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>
        Active Agents
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => (
          <div
            key={agent.agentId}
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <Bot size={18} className="text-white" />
                </div>
                <div
                  className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${statusDotClass[agent.status]}`}
                  style={{ background: statusDotColor[agent.status], borderColor: '#0B1120' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">{agent.agentName}</div>
                <div className="text-[11px] truncate" style={{ color: '#CBD5E1' }}>
                  {getProcessName(agent.agentId)}
                </div>
                <div className="text-xs font-[var(--font-mono-jb)]" style={{ color: '#94A3B8' }}>{agent.model}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] uppercase" style={{ color: '#64748B' }}>1h</div>
                <div className="text-sm font-semibold tabular-nums" style={{ color: agent.successRate1h >= 0.85 ? '#059669' : '#D97706' }}>
                  {(agent.successRate1h * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase" style={{ color: '#64748B' }}>24h</div>
                <div className="text-sm font-semibold tabular-nums" style={{ color: agent.successRate24h >= 0.85 ? '#059669' : '#D97706' }}>
                  {(agent.successRate24h * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase" style={{ color: '#64748B' }}>Sigma</div>
                <SigmaTooltip value={agent.sigmaScore}>
                  <div className="text-sm font-semibold tabular-nums" style={{ color: '#D4AF37' }}>
                    {agent.sigmaScore.toFixed(1)}
                  </div>
                </SigmaTooltip>
              </div>
            </div>

            <div className="mt-2 text-[11px]" style={{ color: '#64748B' }}>
              Last run: {timeAgo(agent.lastRun)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
