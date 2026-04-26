'use client'

import { useMemo, useState } from 'react'
import type { EAITimePoint } from '@/types/aeos'

interface Props {
  points: EAITimePoint[]
}

export function RollingTimeSeries({ points }: Props) {
  const [hover, setHover] = useState<EAITimePoint | null>(null)

  const { width, height, pad } = { width: 1000, height: 280, pad: 36 }
  const xs = useMemo(() => points.map((p, i) => pad + (i / (points.length - 1)) * (width - pad * 2)), [points])
  const allValues = points.flatMap(p => [p.eai, p.hpi])
  const minV = Math.min(...allValues, 0)
  const maxV = Math.max(...allValues, 1)
  const yOf = (v: number) => height - pad - ((v - minV) / (maxV - minV)) * (height - pad * 2)

  const eaiPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${yOf(p.eai).toFixed(1)}`).join(' ')
  const hpiPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${yOf(p.hpi).toFixed(1)}`).join(' ')
  const eaiArea = `${eaiPath} L ${xs[xs.length - 1].toFixed(1)} ${(height - pad).toFixed(1)} L ${xs[0].toFixed(1)} ${(height - pad).toFixed(1)} Z`

  return (
    <div className="aeos-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            EAI · 30-day Rolling
          </div>
          <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
            Each point signed by FuzeBox + rPotential. Click an inflection ↗ for the synthesizing rule.
          </div>
        </div>
        <div className="flex items-center gap-3" style={{ fontSize: 11, color: 'var(--aeos-fg-muted)' }}>
          <span className="flex items-center gap-1">
            <span style={{ width: 12, height: 2, background: 'var(--aeos-accent-primary)' }} /> EAI
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 12, height: 2, background: 'var(--aeos-accent-ok)' }} /> HPI
          </span>
        </div>
      </div>
      <div className="relative" style={{ overflow: 'visible' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="eai-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--aeos-accent-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--aeos-accent-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid */}
          {[0.25, 0.5, 0.75].map(t => (
            <line
              key={t}
              x1={pad}
              x2={width - pad}
              y1={pad + t * (height - pad * 2)}
              y2={pad + t * (height - pad * 2)}
              stroke="var(--aeos-border-divider)"
              strokeDasharray="2 4"
            />
          ))}
          {/* EAI area + line */}
          <path d={eaiArea} fill="url(#eai-fill)" />
          <path d={eaiPath} fill="none" stroke="var(--aeos-accent-primary)" strokeWidth={2} />
          {/* HPI line */}
          <path d={hpiPath} fill="none" stroke="var(--aeos-accent-ok)" strokeWidth={1.5} strokeDasharray="3 3" />
          {/* Inflection markers */}
          {points.map((p, i) =>
            p.inflection ? (
              <g key={p.day}>
                <circle
                  cx={xs[i]}
                  cy={yOf(p.eai)}
                  r={6}
                  fill="var(--aeos-accent-warn)"
                  stroke="var(--aeos-bg-canvas)"
                  strokeWidth={2}
                  onMouseEnter={() => setHover(p)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            ) : null,
          )}
          {/* X-axis labels */}
          {[0, Math.floor(points.length / 2), points.length - 1].map(i => (
            <text key={i} x={xs[i]} y={height - 8} textAnchor="middle" style={{ fontSize: 10, fill: 'var(--aeos-fg-muted)' }}>
              {points[i]?.day.slice(5)}
            </text>
          ))}
        </svg>
        {hover && hover.inflection && (
          <div
            className="absolute aeos-card"
            style={{
              top: 16,
              right: 16,
              maxWidth: 320,
              padding: 12,
              fontSize: 12,
              background: 'var(--aeos-bg-elevated)',
            }}
          >
            <div style={{ color: 'var(--aeos-accent-warn)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Synthesized rule fired
            </div>
            <div className="aeos-mono mt-1" style={{ color: 'var(--aeos-accent-primary)' }}>
              {hover.inflection.rule_id}
            </div>
            <div style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4 }}>{hover.inflection.description}</div>
            <div style={{ color: 'var(--aeos-fg-muted)', marginTop: 6, fontSize: 10 }}>
              {hover.day} · EAI {hover.eai.toFixed(3)} · HPI {hover.hpi.toFixed(3)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
