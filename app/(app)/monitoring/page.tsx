'use client'

import { useState, useEffect, useCallback } from 'react'
import { SystemHealthBanner } from '@/components/monitoring/SystemHealthBanner'
import { MonitoringMetrics } from '@/components/monitoring/MonitoringMetrics'
import { AgentStatusGrid } from '@/components/monitoring/AgentStatusGrid'
import { LiveEventFeed } from '@/components/monitoring/LiveEventFeed'
import {
  getSystemHealth,
  getAgentStatuses,
  getLiveEvents,
  type LiveEvent,
  type AgentStatus,
} from '@/lib/mock-data'

export default function MonitoringPage() {
  const [health, setHealth] = useState(getSystemHealth)
  const [agents, setAgents] = useState<AgentStatus[]>(getAgentStatuses)
  const [events, setEvents] = useState<LiveEvent[]>(() => getLiveEvents(20))
  const [tick, setTick] = useState(0)

  // Simulate live updates every 5 seconds
  const addEvent = useCallback(() => {
    setTick(t => t + 1)
    setEvents(prev => {
      const pool = getLiveEvents(30)
      const nextIdx = (prev.length + tick) % pool.length
      const newEvt: LiveEvent = {
        ...pool[nextIdx],
        id: `EVT-LIVE-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
      return [newEvt, ...prev].slice(0, 50)
    })

    // Occasionally toggle agent status for visual variety
    setAgents(prev =>
      prev.map(a => {
        if (a.agentId === 'recommendation-writer') {
          return {
            ...a,
            status: tick % 3 === 0 ? 'active' : 'degraded',
            lastRun: new Date().toISOString(),
          }
        }
        return { ...a, lastRun: new Date(Date.now() - Math.random() * 300000).toISOString() }
      })
    )
  }, [tick])

  useEffect(() => {
    const interval = setInterval(addEvent, 5000)
    return () => clearInterval(interval)
  }, [addEvent])

  // Compute metrics
  const totalRunsToday = 1247 + tick * 3
  const activeAgentCount = agents.filter(a => a.status !== 'down').length
  const avgSuccess24h = agents.reduce((s, a) => s + a.successRate24h, 0) / agents.length
  const avgLatency = 1842

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
            Live Monitor
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--vip-muted)' }}>
            Real-time agent operations center
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full status-dot-green" style={{ background: '#059669' }} />
          <span className="text-xs font-[var(--font-mono-jb)]" style={{ color: 'var(--vip-muted)' }}>
            Live
          </span>
        </div>
      </div>

      {/* System health banner */}
      <SystemHealthBanner status={health.status} label={health.label} />

      {/* Top metrics bar */}
      <MonitoringMetrics
        totalRunsToday={totalRunsToday}
        successRate24h={avgSuccess24h}
        activeAgents={activeAgentCount}
        avgLatency={avgLatency}
      />

      {/* Main content: agents grid + live feed */}
      <div className="flex gap-5" style={{ minHeight: 520 }}>
        <div className="w-[55%]">
          <AgentStatusGrid agents={agents} />
        </div>
        <div className="w-[45%]">
          <LiveEventFeed events={events} />
        </div>
      </div>
    </div>
  )
}
