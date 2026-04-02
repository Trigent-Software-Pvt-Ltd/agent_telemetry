'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguageMode } from '@/hooks/useLanguageMode'
import { Bell } from 'lucide-react'
import type { LanguageMode } from '@/types/telemetry'

const NOTIFICATIONS = [
  { id: 1, type: 'warning' as const, message: 'Recommendation Writer quality declined to 2.9\u03c3', time: '2 hours ago' },
  { id: 2, type: 'success' as const, message: 'Odds Analysis Agent reached 4.2\u03c3 target', time: '1 day ago' },
  { id: 3, type: 'warning' as const, message: 'Override rate on recommendation tasks: 40%', time: '2 days ago' },
]

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const warningCount = NOTIFICATIONS.filter(n => n.type === 'warning').length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {warningCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
            style={{ width: 16, height: 16, background: 'var(--status-red)' }}
          >
            {warningCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden shadow-lg z-50 animate-fade-up"
          style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3 font-semibold text-sm" style={{ borderBottom: '1px solid var(--border)' }}>
            Notifications
          </div>
          {NOTIFICATIONS.map(notif => (
            <div
              key={notif.id}
              className="px-4 py-3 flex items-start gap-3 row-hover"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span
                className="mt-0.5 flex-shrink-0 inline-block rounded-full"
                style={{
                  width: 8, height: 8,
                  backgroundColor: notif.type === 'warning' ? 'var(--status-amber)' : 'var(--status-green)',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {notif.message}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {notif.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Breadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    roi: 'ROI Calculator',
    export: 'Board Export',
    process: 'Processes',
    agents: 'Agents',
    governance: 'Governance',
    audit: 'Audit Log',
    fmea: 'FMEA Risk Board',
    settings: 'Settings',
    setup: 'Setup',
    occupation: 'Occupation Selector',
    mapping: 'Agent-Task Mapping',
    labor: 'Labor Graph',
    sigma: 'Sigma Scorecard',
    coverage: 'Coverage Map',
    roadmap: 'Roadmap',
    'sports-betting': 'Sports Betting Analyst',
    'customer-service': 'Customer Service Rep',
    'odds-analysis': 'Odds Analysis Agent',
    'line-comparison': 'Line Comparison Agent',
    'recommendation-writer': 'Recommendation Writer Agent',
    'customer-response': 'Customer Response Agent',
  }

  const crumbs = segments.map((seg, i) => ({
    label: labels[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    isLast: i === segments.length - 1,
  }))

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <span style={{ color: '#D1D5DB' }}>/</span>
          )}
          <span
            className={crumb.isLast ? 'font-semibold' : ''}
            style={{ color: crumb.isLast ? '#111827' : '#9CA3AF' }}
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </div>
  )
}

function LanguageToggle() {
  const { mode, setMode } = useLanguageMode()

  const options: { value: LanguageMode; label: string }[] = [
    { value: 'operations', label: 'Operations' },
    { value: 'quality', label: 'Quality' },
  ]

  return (
    <div
      className="inline-flex rounded-lg p-1"
      style={{ background: '#F3F4F6', border: '1px solid #E8E6E0' }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className="px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
          style={{
            background: mode === opt.value ? '#FFFFFF' : 'transparent',
            color: mode === opt.value ? '#111827' : '#6B7280',
            boxShadow: mode === opt.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function TopBar() {
  return (
    <div
      className="flex items-center justify-between py-3.5 px-6 bg-white"
      style={{ borderBottom: '1px solid #E8E6E0' }}
    >
      <Breadcrumb />
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <NotificationBell />
      </div>
    </div>
  )
}
