'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { AGENTS, PROCESSES, ORGANISATION } from '@/lib/mock-data'
import type { Status } from '@/types/telemetry'
import {
  LayoutDashboard,
  Radio,
  DollarSign,
  Award,
  ShieldOff,
  Waypoints,
  Shield,
  AlertTriangle,
  Scale,
  FileText,
  ArrowRightLeft,
  Settings,
  ShieldAlert,
  Wallet,
  BellRing,
  Cable,
  Palette,
  Building2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

/* ── Status dot with pulse animation ───────────────────────────── */

function SidebarDot({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    green: '#1D9E75',
    amber: '#BA7517',
    red: '#E24B4A',
  }
  return (
    <span
      className={clsx('inline-block rounded-full flex-shrink-0', `status-dot-${status}`)}
      style={{ width: 8, height: 8, backgroundColor: colors[status] }}
    />
  )
}

/* ── Warning indicator for below-target agents ─────────────────── */

function WarningDot({ status }: { status: Status }) {
  const color = status === 'red' ? '#E24B4A' : '#BA7517'
  return (
    <span
      className="flex-shrink-0 inline-block rounded-full"
      style={{ width: 6, height: 6, backgroundColor: color, marginLeft: 'auto' }}
      title="Below sigma target"
    />
  )
}

/* ── Navigation item ───────────────────────────────────────────── */

interface NavItemProps {
  href: string
  label: string
  active: boolean
  icon?: React.ReactNode
  status?: Status
  indent?: number // indent level (0 = default, 1 = agent under process)
  badge?: string
  badgeColor?: string
  warningDot?: boolean
  warningStatus?: Status
}

function NavItem({
  href,
  label,
  active,
  icon,
  status,
  indent = 0,
  badge,
  badgeColor,
  warningDot,
  warningStatus = 'amber',
}: NavItemProps) {
  const pl = indent === 0 ? 'pl-5' : indent === 1 ? 'pl-11' : 'pl-14'
  return (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2.5 py-2 text-[13px] transition-colors cursor-pointer',
        pl,
        'pr-4',
        active ? 'font-semibold' : 'hover:text-white',
      )}
      style={{
        color: active ? '#378ADD' : '#9CA3AF',
        borderLeft: active ? '3px solid #378ADD' : '3px solid transparent',
        background: active ? 'rgba(55, 138, 221, 0.08)' : 'transparent',
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {status && <SidebarDot status={status} />}
      <span className="truncate">{label}</span>
      {warningDot && <WarningDot status={warningStatus} />}
      {badge && (
        <span
          className="ml-auto flex-shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: badgeColor || '#E24B4A', minWidth: 20 }}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

/* ── Section label ─────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: '#4B5563' }}
    >
      {children}
    </div>
  )
}

/* ── Collapsible section header ────────────────────────────────── */

function CollapsibleHeader({
  label,
  open,
  onToggle,
}: {
  label: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-5 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
      style={{ color: '#4B5563' }}
    >
      {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      {label}
    </button>
  )
}

/* ── Process group (collapsible, shows agents nested) ──────────── */

function ProcessGroup({
  processId,
  pathname,
}: {
  processId: string
  pathname: string
}) {
  const process = PROCESSES.find(p => p.id === processId)
  const agents = AGENTS.filter(a => a.processId === processId)
  const sigmaTarget = ORGANISATION.sigmaTarget

  const isProcessActive = pathname === `/process/${processId}`
  const isAnyAgentActive = agents.some(a => pathname === `/agents/${a.id}`)
  const [open, setOpen] = useState(isProcessActive || isAnyAgentActive)

  if (!process) return null

  return (
    <div>
      {/* Process row with toggle */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={clsx(
          'relative w-full flex items-center gap-2.5 py-2 pl-5 pr-4 text-[13px] transition-colors cursor-pointer',
          isProcessActive ? 'font-semibold' : 'hover:text-white',
        )}
        style={{
          color: isProcessActive ? '#378ADD' : '#9CA3AF',
          borderLeft: isProcessActive ? '3px solid #378ADD' : '3px solid transparent',
          background: isProcessActive ? 'rgba(55, 138, 221, 0.08)' : 'transparent',
        }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="truncate">{process.name}</span>
      </button>

      {/* Process link (clicking the name navigates) */}
      {open && (
        <>
          {/* Individual process page link (subtle) */}
          <NavItem
            href={`/process/${processId}`}
            label="Overview"
            active={isProcessActive}
            indent={1}
            icon={<ChevronRight size={10} />}
          />
          {/* Agent links */}
          {agents.map(agent => {
            const belowTarget = agent.sigmaScore < sigmaTarget
            return (
              <NavItem
                key={agent.id}
                href={`/agents/${agent.id}`}
                label={agent.name}
                active={pathname === `/agents/${agent.id}`}
                indent={1}
                status={agent.status}
                warningDot={belowTarget}
                warningStatus={agent.status}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

/* ── Main Sidebar ──────────────────────────────────────────────── */

export function Sidebar() {
  const pathname = usePathname()
  const [configureOpen, setConfigureOpen] = useState(
    pathname.startsWith('/settings'),
  )

  // Role check (mock — always admin for demo)
  const isAdmin = true

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col justify-between z-30 overflow-y-auto"
      style={{ width: 260, background: '#0f1117' }}
    >
      <div>
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: '#378ADD', color: '#FFFFFF' }}
          >
            rP
          </div>
          <div>
            <div className="text-white text-sm font-bold font-[var(--font-sora)]">r-Potential</div>
            <div className="text-[11px]" style={{ color: '#6B7280' }}>Powered by FuzeBox</div>
          </div>
        </div>

        {/* Navigation */}
        <nav>
          {/* ── HOME ──────────────────────────────────────────── */}
          <SectionLabel>Home</SectionLabel>
          <NavItem
            href="/dashboard"
            label="Dashboard"
            active={pathname === '/dashboard'}
            icon={<LayoutDashboard size={16} />}
          />
          <NavItem
            href="/monitoring"
            label="Live Monitor"
            active={pathname === '/monitoring'}
            icon={<Radio size={16} />}
          />

          {/* ── MY AI AGENTS ──────────────────────────────────── */}
          <SectionLabel>My AI Agents</SectionLabel>
          {PROCESSES.map(process => (
            <ProcessGroup
              key={process.id}
              processId={process.id}
              pathname={pathname}
            />
          ))}

          {/* ── INSIGHTS ──────────────────────────────────────── */}
          <SectionLabel>Insights</SectionLabel>
          <NavItem
            href="/dashboard/roi"
            label="Financial Impact"
            active={pathname === '/dashboard/roi' || pathname === '/dashboard/costs'}
            icon={<DollarSign size={16} />}
          />
          <NavItem
            href="/dashboard/benchmarks"
            label="Benchmarks"
            active={pathname === '/dashboard/benchmarks' || pathname === '/dashboard/benchmark'}
            icon={<Award size={16} />}
          />
          <NavItem
            href="/analytics/correlations"
            label="Correlations"
            active={pathname === '/analytics/correlations' || pathname.startsWith('/analytics/correlations/')}
            icon={<Waypoints size={16} />}
          />

          {/* ── GOVERNANCE ────────────────────────────────────── */}
          <SectionLabel>Governance</SectionLabel>
          <NavItem
            href="/governance/audit"
            label="Audit Trail"
            active={pathname === '/governance/audit' || pathname.startsWith('/governance/audit/')}
            icon={<Shield size={16} />}
            badge="27%"
            badgeColor="#E24B4A"
          />
          <NavItem
            href="/governance/fmea"
            label="Risk Analysis"
            active={pathname === '/governance/fmea' || pathname.startsWith('/governance/fmea/')}
            icon={<AlertTriangle size={16} />}
          />
          <NavItem
            href="/governance/oversight"
            label="Unreviewed Decisions"
            active={pathname === '/governance/oversight' || pathname.startsWith('/governance/oversight/')}
            icon={<ShieldOff size={16} />}
          />
          <NavItem
            href="/governance/rules"
            label="Rules & Compliance"
            active={pathname === '/governance/rules' || pathname.startsWith('/governance/rules/')}
            icon={<Scale size={16} />}
          />

          {/* ── PLANNING ──────────────────────────────────────── */}
          <SectionLabel>Planning</SectionLabel>
          <NavItem
            href="/dashboard/export"
            label="Board Report"
            active={pathname === '/dashboard/export'}
            icon={<FileText size={16} />}
          />
          <NavItem
            href="/agents/compare"
            label="Agent Comparison"
            active={pathname === '/agents/compare'}
            icon={<ArrowRightLeft size={16} />}
          />

          {/* ── CONFIGURE (collapsed by default) ──────────────── */}
          <CollapsibleHeader
            label="Configure"
            open={configureOpen}
            onToggle={() => setConfigureOpen(prev => !prev)}
          />
          {configureOpen && (
            <>
              <NavItem
                href="/settings"
                label="Settings"
                active={pathname === '/settings'}
                icon={<Settings size={16} />}
              />
              <NavItem
                href="/settings/alerts"
                label="Alerts & SLA"
                active={pathname === '/settings/alerts'}
                icon={<ShieldAlert size={16} />}
              />
              <NavItem
                href="/settings/budgets"
                label="Budgets"
                active={pathname === '/settings/budgets'}
                icon={<Wallet size={16} />}
              />
              <NavItem
                href="/settings/notifications"
                label="Notifications"
                active={pathname === '/settings/notifications'}
                icon={<BellRing size={16} />}
              />
              <NavItem
                href="/settings/integrations"
                label="Integrations"
                active={pathname === '/settings/integrations'}
                icon={<Cable size={16} />}
              />
              <NavItem
                href="/settings/branding"
                label="Branding"
                active={pathname === '/settings/branding'}
                icon={<Palette size={16} />}
              />
            </>
          )}

          {/* ── ADMIN (role-gated) ────────────────────────────── */}
          {isAdmin && (
            <>
              <div className="flex items-center gap-2 px-5 pt-5 pb-2">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: '#4B5563' }}
                >
                  Admin
                </span>
                <span
                  className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(55, 138, 221, 0.15)', color: '#378ADD' }}
                >
                  Admin
                </span>
              </div>
              <NavItem
                href="/admin/organisations"
                label="Organisations"
                active={pathname === '/admin/organisations' || pathname.startsWith('/admin/organisations/')}
                icon={<Building2 size={16} />}
              />
            </>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[11px]" style={{ color: '#4B5563' }}>
          v0.2.0
        </div>
      </div>
    </aside>
  )
}
