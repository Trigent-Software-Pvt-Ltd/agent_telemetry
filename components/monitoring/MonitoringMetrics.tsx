'use client'

import { Activity, CheckCircle, Users, Clock } from 'lucide-react'

interface Props {
  totalRunsToday: number
  successRate24h: number
  activeAgents: number
  avgLatency: number
}

export function MonitoringMetrics({ totalRunsToday, successRate24h, activeAgents, avgLatency }: Props) {
  const cards = [
    { label: 'Runs Today', value: totalRunsToday.toLocaleString(), icon: Activity, color: '#0891B2' },
    { label: 'Success 24h', value: `${(successRate24h * 100).toFixed(1)}%`, icon: CheckCircle, color: '#059669' },
    { label: 'Active Agents', value: String(activeAgents), icon: Users, color: '#D4AF37' },
    { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: '#7C3AED' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${card.color}22` }}
            >
              <Icon size={20} style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>
                {card.label}
              </div>
              <div className="text-lg font-bold font-[var(--font-sora)] tabular-nums text-white">
                {card.value}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
