'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLanguageMode } from '@/hooks/useLanguageMode'
import { Tooltip } from '@/components/shared/Tooltip'
import { Bell, HelpCircle, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import type { LanguageMode } from '@/types/telemetry'

/* ── Notification system (T5: severity tiers + actions) ──────────── */

type NotifSeverity = 'critical' | 'warning' | 'info'

interface Notification {
  id: number
  severity: NotifSeverity
  message: string
  time: string
  agentLink: string
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, severity: 'critical', message: 'Recommendation Writer quality declined to 2.9\u03c3', time: '2 hours ago', agentLink: '/agents/recommendation-writer' },
  { id: 2, severity: 'warning', message: 'Override rate on recommendation tasks: 40%', time: '2 days ago', agentLink: '/agents/recommendation-writer' },
  { id: 3, severity: 'info', message: 'Odds Analysis Agent reached 4.2\u03c3 target', time: '1 day ago', agentLink: '/agents/odds-analysis' },
]

const SEVERITY_CONFIG: Record<NotifSeverity, { bg: string; color: string; label: string }> = {
  critical: { bg: 'var(--status-red-bg)', color: 'var(--status-red)', label: 'Critical' },
  warning: { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', label: 'Warning' },
  info: { bg: 'rgba(55, 138, 221, 0.1)', color: '#378ADD', label: 'Info' },
}

const SEVERITY_ORDER: Record<NotifSeverity, number> = { critical: 0, warning: 1, info: 2 }

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(
    () => [...INITIAL_NOTIFICATIONS].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
  )
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const actionableCount = notifications.filter(n => n.severity === 'critical' || n.severity === 'warning').length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleDismiss(id: number) {
    setNotifications(prev => prev.filter(n => n.id !== id))
    toast.success('Notification acknowledged')
  }

  function handleReview(link: string) {
    setOpen(false)
    router.push(link)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Notifications"
      >
        <Bell size={18} />
        {actionableCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
            style={{ width: 16, height: 16, background: 'var(--status-red)' }}
          >
            {actionableCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-96 rounded-xl overflow-hidden shadow-lg z-50 animate-fade-up"
          style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3 font-semibold text-sm flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <span>Notifications</span>
            {notifications.length > 0 && (
              <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                {notifications.length} alert{notifications.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No notifications
            </div>
          ) : (
            notifications.map(notif => {
              const cfg = SEVERITY_CONFIG[notif.severity]
              return (
                <div
                  key={notif.id}
                  className="px-4 py-3 flex items-start gap-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  {/* Severity badge */}
                  <span
                    className="mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {notif.message}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {notif.time}
                    </p>
                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleReview(notif.agentLink)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        style={{ background: 'var(--vip-navy)', color: '#FFFFFF' }}
                      >
                        Review &rarr;
                      </button>
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="text-xs font-medium px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                        style={{ color: 'var(--text-muted)', background: 'var(--surface)' }}
                      >
                        <X size={12} />
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

/* ── Breadcrumb (T3: updated labels) ─────────────────────────────── */

function Breadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)

  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    roi: 'ROI Calculator',
    export: 'Board Report',
    process: 'Processes',
    agents: 'Agents',
    governance: 'Governance',
    audit: 'Audit Log',
    fmea: 'Risk Analysis',
    oversight: 'Unreviewed Decisions',
    settings: 'Settings',
    setup: 'Setup',
    occupation: 'Occupation Selector',
    mapping: 'Agent-Task Mapping',
    labor: 'Work Distribution',
    sigma: 'Sigma Scorecard',
    coverage: 'Task Assignment',
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

/* ── Language toggle (T3: help icon tooltip) ─────────────────────── */

function LanguageToggle() {
  const { mode, setMode } = useLanguageMode()

  const options: { value: LanguageMode; label: string }[] = [
    { value: 'operations', label: 'Operations' },
    { value: 'quality', label: 'Quality' },
  ]

  return (
    <div className="inline-flex items-center gap-1.5">
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
      <Tooltip content="Operations: plain English metrics. Quality: Six Sigma framework.">
        <HelpCircle size={14} style={{ color: '#9CA3AF', cursor: 'help' }} />
      </Tooltip>
    </div>
  )
}

/* ── TopBar (T6: search button + onSearchClick prop) ─────────────── */

interface TopBarProps {
  onSearchClick?: () => void
}

export function TopBar({ onSearchClick }: TopBarProps) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.toLowerCase().includes('mac')

  return (
    <div
      className="flex items-center justify-between py-3.5 px-6 bg-white"
      style={{ borderBottom: '1px solid #E8E6E0' }}
    >
      <Breadcrumb />
      <div className="flex items-center gap-3">
        {/* Search trigger (T6) */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
          }}
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd
            className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono"
            style={{ background: '#FFFFFF', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            {isMac ? '\u2318K' : 'Ctrl+K'}
          </kbd>
        </button>
        <LanguageToggle />
        <NotificationBell />
      </div>
    </div>
  )
}
