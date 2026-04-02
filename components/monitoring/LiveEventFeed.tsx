'use client'

import { Radio } from 'lucide-react'
import { LiveEvent } from '@/lib/mock-data'
import { EmptyState } from '@/components/shared/EmptyState'

interface Props {
  events: LiveEvent[]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function LiveEventFeed({ events }: Props) {
  return (
    <div
      className="rounded-xl flex flex-col h-full"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-2 h-2 rounded-full status-dot-green" style={{ background: '#059669' }} />
        <h2 className="text-xs font-semibold uppercase" style={{ color: '#94A3B8', letterSpacing: '0.08em' }}>
          Live Event Feed
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1" style={{ maxHeight: 520 }}>
        {(!events || events.length === 0) && (
          <div style={{ color: 'var(--text-muted)' }}>
            <EmptyState
              icon={Radio}
              title="Waiting for events..."
              description="Live events will stream here once agents begin processing."
            />
          </div>
        )}
        {events.map((evt, i) => (
          <div
            key={evt.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-opacity"
            style={{
              background: i === 0 ? 'rgba(212,175,55,0.08)' : 'transparent',
              animation: i === 0 ? 'fade-up 0.3s ease-out' : undefined,
            }}
          >
            <span className="text-[11px] font-[var(--font-mono-jb)] tabular-nums shrink-0" style={{ color: '#64748B' }}>
              {formatTime(evt.timestamp)}
            </span>
            <span className="text-xs text-white truncate flex-1 min-w-0">{evt.agentName}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{
                background: evt.status === 'success' ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)',
                color: evt.status === 'success' ? '#059669' : '#DC2626',
              }}
            >
              {evt.status === 'success' ? 'OK' : 'FAIL'}
            </span>
            <span className="text-[11px] tabular-nums shrink-0" style={{ color: '#94A3B8' }}>
              {evt.duration_ms}ms
            </span>
            <span className="text-[11px] tabular-nums shrink-0" style={{ color: '#94A3B8' }}>
              ${evt.cost.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
