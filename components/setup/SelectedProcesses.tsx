'use client'

import Link from 'next/link'

interface SelectedProcess {
  code: string
  title: string
  status: 'active' | 'pending'
  headcount: number
  wage: number
}

interface SelectedProcessesProps {
  processes: SelectedProcess[]
}

export function SelectedProcesses({ processes }: SelectedProcessesProps) {
  if (processes.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Configured Processes
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {processes.map((p) => {
          const isActive = p.status === 'active'
          return (
            <div key={p.code} className="card">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {p.title}
                  </h4>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {p.code}
                  </span>
                </div>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{
                    background: isActive ? 'var(--status-green-bg)' : 'var(--status-amber-bg)',
                    color: isActive ? 'var(--status-green)' : 'var(--status-amber)',
                  }}
                >
                  {isActive ? 'Active' : 'Pending setup'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{p.headcount} staff</span>
                <span>${p.wage}/hr</span>
              </div>
            </div>
          )
        })}
      </div>

      <Link
        href="/setup/mapping"
        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ color: 'var(--accent-blue)' }}
      >
        Continue to agent mapping &rarr;
      </Link>
    </div>
  )
}
