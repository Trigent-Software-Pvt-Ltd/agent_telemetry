'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { AGENTS, PROCESSES, ORGANISATION } from '@/lib/mock-data'
import type { Status } from '@/types/telemetry'
import {
  LayoutDashboard,
  Calculator,
  FileText,
  Bot,
  Shield,
  ShieldOff,
  ShieldAlert,
  AlertTriangle,
  Search,
  GitBranch,
  Settings,
  ChevronRight,
  DollarSign,
  Scale,
  BarChart3,
  GraduationCap,
  Radio,
  Wallet,
  BellRing,
  Users,
  Cable,
  Palette,
  Building2,
  Award,
  Waypoints,
  ArrowRightLeft,
} from 'lucide-react'

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

interface NavItemProps {
  href: string
  label: string
  active: boolean
  icon?: React.ReactNode
  status?: Status
  indent?: boolean
  badge?: string
  badgeColor?: string
  warningDot?: boolean
}

function NavItem({ href, label, active, icon, status, indent, badge, badgeColor, warningDot }: NavItemProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2.5 py-2 text-[13px] transition-colors cursor-pointer',
        indent ? 'pl-11 pr-4' : 'pl-5 pr-4',
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
      {warningDot && (
        <span
          className="flex-shrink-0 inline-block rounded-full"
          style={{ width: 6, height: 6, backgroundColor: '#BA7517', marginLeft: 'auto' }}
          title="Below sigma target"
        />
      )}
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

export function Sidebar() {
  const pathname = usePathname()

  const sportsBettingAgents = AGENTS.filter(a => a.processId === 'sports-betting')
  const customerServiceAgents = AGENTS.filter(a => a.processId === 'customer-service')
  const sportsBettingProcess = PROCESSES.find(p => p.id === 'sports-betting')
  const customerServiceProcess = PROCESSES.find(p => p.id === 'customer-service')

  const sigmaTarget = ORGANISATION.sigmaTarget

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
          {/* OVERVIEW */}
          <SectionLabel>Overview</SectionLabel>
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
          <NavItem
            href="/dashboard/roi"
            label="ROI Calculator"
            active={pathname === '/dashboard/roi'}
            icon={<Calculator size={16} />}
          />
          <NavItem
            href="/dashboard/export"
            label="Board Export"
            active={pathname === '/dashboard/export'}
            icon={<FileText size={16} />}
          />
          <NavItem
            href="/dashboard/costs"
            label="Cost Analysis"
            active={pathname === '/dashboard/costs'}
            icon={<DollarSign size={16} />}
          />
          <NavItem
            href="/dashboard/benchmark"
            label="Benchmark"
            active={pathname === '/dashboard/benchmark'}
            icon={<BarChart3 size={16} />}
          />
          <NavItem
            href="/dashboard/benchmarks"
            label="Industry Benchmarks"
            active={pathname === '/dashboard/benchmarks'}
            icon={<Award size={16} />}
          />

          {/* PROCESSES */}
          <SectionLabel>Processes</SectionLabel>

          {/* Sports Betting Analyst */}
          <NavItem
            href="/process/sports-betting"
            label="Sports Betting Analyst"
            active={pathname === '/process/sports-betting'}
            status={sportsBettingProcess?.status}
          />
          <NavItem
            href="/process/sports-betting/labor"
            label="Labor graph"
            active={pathname === '/process/sports-betting/labor'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/sports-betting/sigma"
            label="Sigma scorecard"
            active={pathname === '/process/sports-betting/sigma'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/sports-betting/coverage"
            label="Coverage map"
            active={pathname === '/process/sports-betting/coverage'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/sports-betting/roadmap"
            label="Roadmap"
            active={pathname === '/process/sports-betting/roadmap'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/sports-betting/training"
            label="Training Plan"
            active={pathname === '/process/sports-betting/training'}
            indent
            icon={<GraduationCap size={12} />}
          />
          <NavItem
            href="/process/sports-betting/workforce"
            label="Workforce Plan"
            active={pathname === '/process/sports-betting/workforce'}
            indent
            icon={<Users size={12} />}
          />

          {/* Customer Service */}
          <NavItem
            href="/process/customer-service"
            label="Customer Service Rep"
            active={pathname === '/process/customer-service'}
            status={customerServiceProcess?.status}
          />
          <NavItem
            href="/process/customer-service/sigma"
            label="Sigma scorecard"
            active={pathname === '/process/customer-service/sigma'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/customer-service/coverage"
            label="Coverage map"
            active={pathname === '/process/customer-service/coverage'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/customer-service/roadmap"
            label="Roadmap"
            active={pathname === '/process/customer-service/roadmap'}
            indent
            icon={<ChevronRight size={12} />}
          />
          <NavItem
            href="/process/customer-service/training"
            label="Training Plan"
            active={pathname === '/process/customer-service/training'}
            indent
            icon={<GraduationCap size={12} />}
          />
          <NavItem
            href="/process/customer-service/workforce"
            label="Workforce Plan"
            active={pathname === '/process/customer-service/workforce'}
            indent
            icon={<Users size={12} />}
          />

          {/* AGENTS */}
          <SectionLabel>Agents</SectionLabel>
          <NavItem
            href="/agents/compare"
            label="Agent Comparison"
            active={pathname === '/agents/compare'}
            icon={<Scale size={16} />}
          />
          {sportsBettingAgents.map(agent => (
            <NavItem
              key={agent.id}
              href={`/agents/${agent.id}`}
              label={agent.name}
              active={pathname === `/agents/${agent.id}`}
              status={agent.status}
              warningDot={agent.sigmaScore < sigmaTarget}
            />
          ))}
          {customerServiceAgents.map(agent => (
            <NavItem
              key={agent.id}
              href={`/agents/${agent.id}`}
              label={agent.name}
              active={pathname === `/agents/${agent.id}`}
              status={agent.status}
              warningDot={agent.sigmaScore < sigmaTarget}
            />
          ))}

          {/* GOVERNANCE */}
          <SectionLabel>Governance</SectionLabel>
          <NavItem
            href="/governance/audit"
            label="Audit log"
            active={pathname === '/governance/audit' || pathname.startsWith('/governance/audit/')}
            icon={<Shield size={16} />}
            badge="27%"
            badgeColor="#E24B4A"
          />
          <NavItem
            href="/governance/fmea"
            label="FMEA Risk Board"
            active={pathname === '/governance/fmea' || pathname.startsWith('/governance/fmea/')}
            icon={<AlertTriangle size={16} />}
          />
          <NavItem
            href="/governance/oversight"
            label="Oversight Gaps"
            active={pathname === '/governance/oversight' || pathname.startsWith('/governance/oversight/')}
            icon={<ShieldOff size={16} />}
          />
          <NavItem
            href="/governance/rules"
            label="Rules"
            active={pathname === '/governance/rules' || pathname.startsWith('/governance/rules/')}
            icon={<Scale size={16} />}
          />

          {/* ANALYTICS */}
          <SectionLabel>Analytics</SectionLabel>
          <NavItem
            href="/analytics/correlations"
            label="Correlations"
            active={pathname === '/analytics/correlations' || pathname.startsWith('/analytics/correlations/')}
            icon={<Waypoints size={16} />}
          />

          {/* SETUP */}
          <SectionLabel>Setup</SectionLabel>
          <NavItem
            href="/setup/occupation"
            label="Occupation selector"
            active={pathname === '/setup/occupation' || pathname.startsWith('/setup/occupation/')}
            icon={<Search size={16} />}
          />
          <NavItem
            href="/setup/mapping"
            label="Agent-task mapping"
            active={pathname === '/setup/mapping' || pathname.startsWith('/setup/mapping/')}
            icon={<GitBranch size={16} />}
          />

          {/* SETTINGS */}
          <div className="mt-2">
            <NavItem
              href="/settings"
              label="Settings"
              active={pathname === '/settings' || pathname.startsWith('/settings/')}
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
          </div>

          {/* ADMIN */}
          <SectionLabel>Admin</SectionLabel>
          <NavItem
            href="/admin/organisations"
            label="Organisations"
            active={pathname === '/admin/organisations' || pathname.startsWith('/admin/organisations/')}
            icon={<Building2 size={16} />}
          />
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
