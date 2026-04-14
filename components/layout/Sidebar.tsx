'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  Briefcase,
  Search,
  ClipboardCheck,
  Scale,
  FileCode,
  Database,
  FileText,
  Settings,
} from 'lucide-react'

/* ── Navigation item ───────────────────────────────────────────── */

interface NavItemProps {
  href: string
  label: string
  active: boolean
  icon?: React.ReactNode
}

function NavItem({ href, label, active, icon }: NavItemProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'relative flex items-center gap-2.5 py-2 pl-5 pr-4 text-[13px] transition-colors cursor-pointer',
        active ? 'font-semibold' : 'hover:text-white',
      )}
      style={{
        color: active ? '#378ADD' : '#9CA3AF',
        borderLeft: active ? '3px solid #378ADD' : '3px solid transparent',
        background: active ? 'rgba(55, 138, 221, 0.08)' : 'transparent',
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
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

/* ── Main Sidebar ──────────────────────────────────────────────── */

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string, exact = false) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + '/')

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col justify-between z-30 overflow-y-auto"
      style={{ width: 260, background: '#0f1117' }}
    >
      <div>
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <Image
            src="/quadrant-logo.png"
            alt="Quadrant Two Capital Partners"
            width={160}
            height={36}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div className="px-5 pb-3 text-[10px] tracking-wider uppercase" style={{ color: '#6B7280' }}>
          AI Console · Delivered by FuzeBox
        </div>

        {/* Navigation */}
        <nav>
          <SectionLabel>Agents</SectionLabel>
          <NavItem
            href="/agents/chief-of-staff"
            label="Chief of Staff"
            active={isActive('/agents/chief-of-staff')}
            icon={<Briefcase size={16} />}
          />
          <NavItem
            href="/agents/sourcing-agent"
            label="Sourcing Agent"
            active={isActive('/agents/sourcing-agent')}
            icon={<Search size={16} />}
          />

          <SectionLabel>Sourcing</SectionLabel>
          <NavItem
            href="/sourcing/review"
            label="Candidate Review"
            active={isActive('/sourcing/review')}
            icon={<ClipboardCheck size={16} />}
          />

          <SectionLabel>Governance</SectionLabel>
          <NavItem
            href="/governance/rules"
            label="Rules & Evidence"
            active={isActive('/governance/rules') || isActive('/governance/audit')}
            icon={<Scale size={16} />}
          />

          <SectionLabel>Chief of Staff</SectionLabel>
          <NavItem
            href="/chief-of-staff/prompts"
            label="Prompt Registry"
            active={isActive('/chief-of-staff/prompts')}
            icon={<FileCode size={16} />}
          />

          <SectionLabel>Configure</SectionLabel>
          <NavItem
            href="/settings/data-sources"
            label="Data Sources"
            active={isActive('/settings/data-sources')}
            icon={<Database size={16} />}
          />
          <NavItem
            href="/reports/day5"
            label="Reports"
            active={isActive('/reports') || isActive('/dashboard/export')}
            icon={<FileText size={16} />}
          />
          <NavItem
            href="/settings"
            label="Settings"
            active={pathname === '/settings'}
            icon={<Settings size={16} />}
          />
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[11px]" style={{ color: '#4B5563' }}>
          Quadrant × FuzeBox · v0.3.0
        </div>
      </div>
    </aside>
  )
}
