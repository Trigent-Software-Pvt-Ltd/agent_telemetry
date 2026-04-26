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
} from 'lucide-react'
import { useAEOSDemo } from './AEOSDemoProvider'
import { TenantSwitcher } from '@/components/aeos/shared/TenantSwitcher'

const NAV: Array<{ href: string; label: string; Icon: typeof Activity }> = [
  { href: '/', label: 'Decision Explorer', Icon: Activity },
  { href: '/eai', label: 'EAI Board', Icon: BarChart3 },
  { href: '/ledger', label: 'Ledger', Icon: ScrollText },
  { href: '/policy-packs', label: 'Policy Packs', Icon: ShieldCheck },
  { href: '/skills', label: 'Skills Authority', Icon: Brain },
  { href: '/evidence', label: 'Evidence Export', Icon: Package },
  { href: '/dir', label: 'Dynamic Instructions', Icon: Zap },
]

export function AEOSSidebar() {
  const pathname = usePathname()
  const { start, isPlaying } = useAEOSDemo()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: 260,
        background: 'var(--aeos-bg-nested)',
        borderRight: '1px solid var(--aeos-border-line)',
      }}
    >
      {/* Brand block */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="aeos-mono"
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--aeos-fg-primary)',
            }}
          >
            AEOS
          </div>
          <span className="aeos-pill" style={{ fontSize: 9 }}>DEMO</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', marginBottom: 12 }}>
          FuzeBox <span style={{ color: 'var(--aeos-accent-fuzebox)' }}>●</span>{' '}
          + rPotential <span style={{ color: 'var(--aeos-accent-rpotential)' }}>●</span>
        </div>
        <TenantSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Landing item */}
        <SidebarLink
          href="/"
          label="Mission Control"
          Icon={Activity}
          active={pathname === '/'}
        />
        <div
          style={{
            margin: '12px 12px 6px',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--aeos-fg-muted)',
          }}
        >
          The decision loop
        </div>
        <SidebarLink
          href="/decisions"
          label="Decision Explorer"
          Icon={Activity}
          active={pathname.startsWith('/decisions')}
        />
        <SidebarLink href="/eai" label="EAI Board" Icon={BarChart3} active={pathname === '/eai'} />
        <SidebarLink
          href="/ledger"
          label="Ledger"
          Icon={ScrollText}
          active={pathname === '/ledger'}
        />
        <div
          style={{
            margin: '12px 12px 6px',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--aeos-fg-muted)',
          }}
        >
          Governance
        </div>
        <SidebarLink
          href="/policy-packs"
          label="Policy Packs"
          Icon={ShieldCheck}
          active={pathname === '/policy-packs'}
        />
        <SidebarLink
          href="/skills"
          label="Skills Authority"
          Icon={Brain}
          active={pathname === '/skills'}
        />
        <SidebarLink
          href="/evidence"
          label="Evidence Export"
          Icon={Package}
          active={pathname === '/evidence'}
        />
        <SidebarLink
          href="/dir"
          label="Dynamic Instructions"
          Icon={Zap}
          active={pathname === '/dir'}
        />
      </nav>

      {/* Footer: signed badges + run demo */}
      <div
        className="px-4 py-4 space-y-3"
        style={{ borderTop: '1px solid var(--aeos-border-divider)' }}
      >
        <button
          type="button"
          onClick={start}
          disabled={isPlaying}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md transition-opacity"
          style={{
            background: 'var(--aeos-accent-primary)',
            color: 'var(--aeos-bg-canvas)',
            fontWeight: 600,
            fontSize: 13,
            opacity: isPlaying ? 0.5 : 1,
          }}
        >
          <Play size={14} />
          {isPlaying ? 'Demo running…' : 'Run 90-sec demo'}
        </button>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
            <CheckCircle2 size={12} style={{ color: 'var(--aeos-accent-ok)' }} />
            Coverage manifest verified
          </div>
          <div className="flex items-center gap-2" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
            <CheckCircle2 size={12} style={{ color: 'var(--aeos-accent-ok)' }} />
            Two-party attestation active
          </div>
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string
  label: string
  Icon: typeof Activity
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
      style={{
        background: active ? 'var(--aeos-bg-elevated)' : 'transparent',
        color: active ? 'var(--aeos-fg-primary)' : 'var(--aeos-fg-secondary)',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        borderLeft: active
          ? '2px solid var(--aeos-accent-primary)'
          : '2px solid transparent',
      }}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  )
}
