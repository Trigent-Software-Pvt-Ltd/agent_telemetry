'use client'

import { useMemo } from 'react'
import type { LedgerRow } from '@/types/aeos'

interface Props {
  rows: LedgerRow[]
}

const PATH_COLOR: Record<string, string> = {
  human: 'var(--aeos-accent-ok)',
  anthropic_agent: '#c4a875',
  openai_agent: '#34d399',
  google_vertex_agent: '#a78bfa',
  salesforce_agent: '#60a5fa',
  cloudflare_agent: '#fb923c',
  uniphore_agent: '#f472b6',
  hybrid_anthropic_human: 'var(--aeos-accent-primary)',
  hybrid_openai_human: '#7dd3fc',
}

const PATH_LABEL: Record<string, string> = {
  human: 'Human',
  anthropic_agent: 'Anthropic',
  openai_agent: 'OpenAI',
  google_vertex_agent: 'Vertex',
  salesforce_agent: 'Agentforce',
  cloudflare_agent: 'Cloudflare',
  uniphore_agent: 'Uniphore',
  hybrid_anthropic_human: 'Anthropic+H',
  hybrid_openai_human: 'OpenAI+H',
}

export function PathMixDonut({ rows }: Props) {
  const segments = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of rows) counts[r.selected_path] = (counts[r.selected_path] ?? 0) + 1
    const total = rows.length || 1
    return Object.entries(counts)
      .map(([path, n]) => ({ path, n, pct: n / total }))
      .sort((a, b) => b.n - a.n)
  }, [rows])

  // Build SVG donut
  const radius = 64
  const stroke = 18
  const cx = 80
  const cy = 80
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="aeos-card flex gap-4">
      <div>
        <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Path Mix
        </div>
        <svg width={160} height={160}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--aeos-bg-nested)" strokeWidth={stroke} />
          {segments.map(s => {
            const dash = s.pct * circumference
            const el = (
              <circle
                key={s.path}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={PATH_COLOR[s.path] ?? 'var(--aeos-fg-muted)'}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray var(--aeos-motion)' }}
              />
            )
            offset += dash
            return el
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" className="aeos-mono" style={{ fontSize: 22, fill: 'var(--aeos-fg-primary)' }}>
            {rows.length}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>
            executions
          </text>
        </svg>
      </div>
      <div className="flex-1 grid grid-cols-1 gap-1.5 self-center">
        {segments.slice(0, 6).map(s => (
          <div key={s.path} className="flex items-center gap-2" style={{ fontSize: 12 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: PATH_COLOR[s.path] ?? 'var(--aeos-fg-muted)',
              }}
            />
            <span style={{ color: 'var(--aeos-fg-primary)', flex: 1 }}>
              {PATH_LABEL[s.path] ?? s.path}
            </span>
            <span className="aeos-mono" style={{ color: 'var(--aeos-fg-secondary)' }}>
              {(s.pct * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
