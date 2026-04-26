'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  BarChart3,
  ScrollText,
  ShieldCheck,
  Brain,
  Package,
  Zap,
  Play,
  CheckCircle2,
  Home,
} from 'lucide-react'
import { useAEOSDemo } from './AEOSDemoProvider'
import { TenantSwitcher } from '@/components/aeos/shared/TenantSwitcher'

export function AEOSSidebar() {
  const pathname = usePathname()
  const { start, isPlaying } = useAEOSDemo()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col justify-between z-30 overflow-y-auto"
      style={{ width: 260, background: '#0f1117' }}
    >
      <div>
        {/* Logo block — matches main sidebar pattern */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: '#378ADD', color: '#FFFFFF' }}
          >
            rP
          </div>
          <div>
            <div className="text-white text-sm font-bold font-[var(--font-sora)]">AEOS</div>
            <div className="text-[11px]" style={{ color: '#6B7280' }}>FuzeBox + rPotential</div>
          </div>
        </div>

        {/* Tenant switcher */}
        <div className="px-5 pb-4">
          <TenantSwitcher />
        </div>

        {/* Navigation */}
        <nav>
          <SectionLabel>Home</SectionLabel>
          <NavItem href="/" label="Mission Control" icon={<Home size={16} />} active={pathname === '/'} />

          <SectionLabel>The Decision Loop</SectionLabel>
          <NavItem
            href="/decisions"
            label="Decision Explorer"
            icon={<Activity size={16} />}
            active={pathname.startsWith('/decisions')}
          />
          <NavItem
            href="/eai"
            label="EAI Board"
            icon={<BarChart3 size={16} />}
            active={pathname === '/eai'}
          />
          <NavItem
            href="/ledger"
            label="Ledger"
            icon={<ScrollText size={16} />}
            active={pathname === '/ledger'}
          />

          <SectionLabel>Governance</SectionLabel>
          <NavItem
            href="/policy-packs"
            label="Policy Packs"
            icon={<ShieldCheck size={16} />}
            active={pathname === '/policy-packs'}
          />
          <NavItem
            href="/skills"
            label="Skills Authority"
            icon={<Brain size={16} />}
            active={pathname === '/skills'}
          />
          <NavItem
            href="/evidence"
            label="Evidence Export"
            icon={<Package size={16} />}
            active={pathname === '/evidence'}
          />
          <NavItem
            href="/dir"
            label="Dynamic Instructions"
            icon={<Zap size={16} />}
            active={pathname === '/dir'}
          />
        </nav>
      </div>

      {/* Footer: run demo + signed pills */}
      <div className="px-4 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          type="button"
          onClick={start}
          disabled={isPlaying}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-opacity"
          style={{
            background: '#378ADD',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 13,
            opacity: isPlaying ? 0.5 : 1,
          }}
        >
          <Play size={14} />
          {isPlaying ? 'Demo running…' : 'Run 90-sec demo'}
        </button>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#9CA3AF' }}>
            <CheckCircle2 size={12} style={{ color: '#1D9E75' }} />
            Coverage manifest verified
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 11, color: '#9CA3AF' }}>
            <CheckCircle2 size={12} style={{ color: '#1D9E75' }} />
            Two-party attestation active
          </div>
        </div>
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-5 pt-5 pb-2 text-[11px] font-semibold tracking-wider uppercase"
      style={{ color: '#6B7280' }}
    >
      {children}
    </div>
  )
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-5 py-2 transition-colors"
      style={{
        background: active ? 'rgba(55, 138, 221, 0.12)' : 'transparent',
        color: active ? '#FFFFFF' : '#9CA3AF',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        borderLeft: active
          ? '2px solid #378ADD'
          : '2px solid transparent',
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
