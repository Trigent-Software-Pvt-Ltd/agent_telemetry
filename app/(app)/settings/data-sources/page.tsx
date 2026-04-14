import type { Metadata } from 'next'
import { DATA_SOURCES } from '@/lib/quadrant-mock'
import { Database, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Data Sources' }

const STATUS_STYLES = {
  connected: { label: 'Connected', color: '#1D9E75', bg: 'rgba(29,158,117,0.12)', Icon: CheckCircle2 },
  partial: { label: 'Partial', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', Icon: AlertTriangle },
  missing: { label: 'Missing', color: '#E24B4A', bg: 'rgba(226,75,74,0.12)', Icon: XCircle },
} as const

export default function Page() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Configure
        </div>
        <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Data Sources
        </h1>
        <p className="text-sm mt-2 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
          Upstream systems the Chief of Staff and Sourcing Agent pull from. Gaps surfaced here are the main
          input to the Day-5 decision on whether to extend engagement.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {DATA_SOURCES.map(s => {
          const sty = STATUS_STYLES[s.status]
          const Icon = sty.Icon
          return (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--surface-muted, #F7F9FC)' }}
                  >
                    <Database size={18} style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                      {s.id}
                    </div>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ background: sty.bg, color: sty.color }}
                >
                  <Icon size={12} /> {sty.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div>
                  <div className="uppercase" style={{ color: 'var(--text-muted)' }}>Last sync</div>
                  <div className="font-mono mt-0.5">{new Date(s.lastSync).toLocaleString()}</div>
                </div>
                <div>
                  <div className="uppercase" style={{ color: 'var(--text-muted)' }}>Records indexed</div>
                  <div className="font-semibold mt-0.5">{s.recordsIndexed.toLocaleString()}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)' }}>
                <div className="uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Known gaps</div>
                <div style={{ color: 'var(--text-secondary)' }}>{s.knownGaps}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
