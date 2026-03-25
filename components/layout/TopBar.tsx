'use client'

import { WORKFLOWS } from '@/lib/mock-data'
import { computeSummary } from '@/lib/mock-data'
import { VerdictBadge } from '@/components/shared/VerdictBadge'
import { ExportButton } from '@/components/shared/ExportButton'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface TopBarProps {
  activeWorkflowId: string
  onWorkflowChange: (id: string) => void
  showWorkflowSelector?: boolean
}

export function TopBar({ activeWorkflowId, onWorkflowChange, showWorkflowSelector = true }: TopBarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeWorkflow = WORKFLOWS.find(w => w.id === activeWorkflowId)!
  const activeSummary = computeSummary(activeWorkflowId)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const dateRanges = ['24h', '7d', '30d', '90d']
  const [activeRange, setActiveRange] = useState('30d')

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-white border-b" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-4">
        {showWorkflowSelector && (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold font-[var(--font-sora)] cursor-pointer"
              style={{ borderColor: '#E2E8F0', color: '#0A1628' }}
            >
              {activeWorkflow.name}
              <VerdictBadge verdict={activeSummary.verdict} size="sm" />
              <ChevronDown size={16} style={{ color: '#64748B' }} />
            </button>
            {open && (
              <div
                className="absolute top-full left-0 mt-1 w-80 rounded-lg border bg-white z-50"
                style={{ borderColor: '#E2E8F0', boxShadow: '0 4px 16px rgba(10,22,40,0.12)' }}
              >
                {WORKFLOWS.map(w => {
                  const s = computeSummary(w.id)
                  return (
                    <button
                      key={w.id}
                      onClick={() => { onWorkflowChange(w.id); setOpen(false) }}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors cursor-pointer row-hover"
                      style={{ borderBottom: '1px solid #E2E8F0' }}
                    >
                      <div>
                        <div className="font-semibold" style={{ color: '#0A1628' }}>{w.name}</div>
                        <div className="text-xs" style={{ color: '#64748B' }}>{w.framework} · {w.model}</div>
                      </div>
                      <VerdictBadge verdict={s.verdict} size="sm" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          {dateRanges.map(range => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: activeRange === range ? '#E8EEF5' : 'transparent',
                color: activeRange === range ? '#0A1628' : '#64748B',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <ExportButton />
    </div>
  )
}
