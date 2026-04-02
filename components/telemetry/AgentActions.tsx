'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Power, Pause, ArrowRightLeft } from 'lucide-react'

interface AgentActionsProps {
  onDecommission: () => void
  onPause: () => void
  onReassign: () => void
  agentStatus: 'active' | 'paused' | 'decommissioned'
}

export function AgentActions({ onDecommission, onPause, onReassign, agentStatus }: AgentActionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const actions = [
    {
      label: agentStatus === 'paused' ? 'Resume Agent' : 'Pause Agent',
      icon: Pause,
      onClick: onPause,
      color: '#D97706',
    },
    {
      label: 'Reassign Tasks',
      icon: ArrowRightLeft,
      onClick: onReassign,
      color: '#0891B2',
    },
    {
      label: 'Decommission',
      icon: Power,
      onClick: onDecommission,
      color: '#DC2626',
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold font-[var(--font-sora)] cursor-pointer transition-colors"
        style={{
          background: '#0A1628',
          color: '#FFFFFF',
        }}
      >
        Actions
        <ChevronDown size={16} />
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-56 rounded-lg border bg-white z-50"
          style={{ borderColor: '#E2E8F0', boxShadow: '0 4px 16px rgba(10,22,40,0.12)' }}
        >
          {actions.map(action => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => { action.onClick(); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors cursor-pointer row-hover"
                style={{ borderBottom: '1px solid #F1F5F9' }}
              >
                <Icon size={16} style={{ color: action.color }} />
                <span style={{ color: '#0A1628' }}>{action.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
