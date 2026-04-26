'use client'

import { useState } from 'react'
import type { CoverageManifest } from '@/types/aeos'
import { ChevronDown, CheckCircle2, MinusCircle, Circle } from 'lucide-react'

interface Props {
  manifest: CoverageManifest
}

const LAYERS: Array<{ key: 'hyperscaler' | 'model_lab' | 'agent_platform' | 'tool_surface'; label: string }> = [
  { key: 'hyperscaler', label: 'Hyperscalers' },
  { key: 'model_lab', label: 'Frontier model labs' },
  { key: 'agent_platform', label: 'Agent platforms' },
  { key: 'tool_surface', label: 'Tool surfaces' },
]

export function CoverageManifestCard({ manifest }: Props) {
  const [expanded, setExpanded] = useState(false)

  const counts = LAYERS.map(L => ({
    ...L,
    observed: manifest.vendors.filter(v => v.layer === L.key && v.status === 'observed').length,
    total: manifest.vendors.filter(v => v.layer === L.key).length,
  }))

  return (
    <div className="aeos-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Coverage Manifest
          </div>
          <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
            {manifest.observed_count} observed · {manifest.gap_count} gap · {manifest.planned_count} planned ·{' '}
            <span style={{ color: 'var(--aeos-accent-ok)' }}>signed by both parties ✓</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs"
          style={{ color: 'var(--aeos-fg-secondary)' }}
        >
          {expanded ? 'Collapse' : 'Show vendors'}
          <ChevronDown
            size={12}
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 150ms' }}
          />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {counts.map(c => (
          <div
            key={c.key}
            className="px-3 py-2 rounded-md"
            style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)' }}
          >
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>{c.label}</div>
            <div className="aeos-mono" style={{ fontSize: 18, color: 'var(--aeos-fg-primary)', marginTop: 2 }}>
              {c.observed}<span style={{ color: 'var(--aeos-fg-muted)', fontSize: 13 }}>/{c.total}</span>
            </div>
          </div>
        ))}
      </div>
      {expanded && (
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 max-h-72 overflow-y-auto">
          {manifest.vendors.map(v => (
            <div key={v.vendor} className="flex items-center gap-2 py-1" style={{ fontSize: 12 }}>
              {v.status === 'observed' && <CheckCircle2 size={12} style={{ color: 'var(--aeos-accent-ok)' }} />}
              {v.status === 'gap' && <MinusCircle size={12} style={{ color: 'var(--aeos-accent-bad)' }} />}
              {v.status === 'planned' && <Circle size={12} style={{ color: 'var(--aeos-accent-warn)' }} />}
              <span style={{ color: 'var(--aeos-fg-primary)', flex: 1 }}>{v.vendor}</span>
              <span style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>{v.layer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
