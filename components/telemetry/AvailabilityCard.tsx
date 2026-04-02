'use client'

import { Shield, Clock, AlertCircle } from 'lucide-react'
import type { AgentAvailability } from '@/types/telemetry'

interface AvailabilityCardProps {
  availability: AgentAvailability
}

export default function AvailabilityCard({ availability }: AvailabilityCardProps) {
  const { uptimePct, mttrMinutes, incidents } = availability

  // Color based on uptime level
  const uptimeColor =
    uptimePct >= 99 ? 'var(--status-green)' :
    uptimePct >= 97 ? 'var(--status-amber)' :
    'var(--status-red)'

  const uptimeBg =
    uptimePct >= 99 ? 'var(--status-green-bg)' :
    uptimePct >= 97 ? 'var(--status-amber-bg)' :
    'var(--status-red-bg)'

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-text-muted" />
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Availability
          </h3>
        </div>
        <span className="text-xs text-text-muted">Last 30 days</span>
      </div>

      {/* Uptime + MTTR stats */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <p className="text-2xl font-bold tabular-nums" style={{ color: uptimeColor }}>
            {uptimePct}%
          </p>
          <p className="text-xs text-text-muted">Uptime</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-text-primary">
            {mttrMinutes}<span className="text-sm font-normal text-text-muted ml-0.5">min</span>
          </p>
          <p className="text-xs text-text-muted">Avg recovery (MTTR)</p>
        </div>
      </div>

      {/* Uptime bar */}
      <div className="mb-4">
        <div className="h-3 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${uptimePct}%`,
              backgroundColor: uptimeColor,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-text-muted">0%</span>
          <span
            className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: uptimeBg, color: uptimeColor }}
          >
            {uptimePct}% uptime
          </span>
          <span className="text-[11px] text-text-muted">100%</span>
        </div>
      </div>

      {/* Incidents */}
      {incidents.length > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-text-muted" />
            <p className="text-xs text-text-muted uppercase tracking-wide">
              Recent Incidents ({incidents.length})
            </p>
          </div>
          <div className="space-y-2">
            {incidents.map((incident, i) => {
              const date = new Date(incident.date)
              const dateStr = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 px-2.5 py-2 rounded-lg bg-surface"
                >
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted tabular-nums w-16">{dateStr}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary truncate">{incident.cause}</p>
                    <p className="text-[11px] text-text-muted tabular-nums mt-0.5">
                      Duration: {incident.durationMinutes} min
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
