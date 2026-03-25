'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { LayoutDashboard, Workflow, GitCompare, FileText, Settings } from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'MONITOR',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Workflows', href: '/workflows', icon: Workflow },
    ],
  },
  {
    label: 'ANALYZE',
    items: [
      { name: 'Compare', href: '/compare', icon: GitCompare },
      { name: 'Reports', href: '/reports', icon: FileText },
    ],
  },
  {
    label: 'CONFIGURE',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col justify-between z-30"
      style={{ width: 240, background: '#0A1628' }}
    >
      <div>
        {/* Logo */}
        <div className="px-5 py-6 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: '#D4AF37', color: '#0A1628' }}
          >
            ◆
          </div>
          <div>
            <div className="text-white text-sm font-bold font-[var(--font-sora)]">VIPPlay</div>
            <div className="text-[11px]" style={{ color: '#94A3B8' }}>Agent Telemetry</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-2">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-4">
              <div
                className="px-5 mb-1 text-[10px] font-semibold uppercase"
                style={{ color: '#475569', letterSpacing: '0.08em' }}
              >
                {section.label}
              </div>
              {section.items.map(item => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'relative flex items-center gap-3 px-5 py-2.5 text-sm transition-colors',
                      active ? 'font-semibold' : 'hover:text-white'
                    )}
                    style={{
                      color: active ? '#D4AF37' : '#94A3B8',
                      background: active ? '#1E3A5F' : 'transparent',
                      borderLeft: active ? '3px solid #D4AF37' : '3px solid transparent',
                    }}
                  >
                    <Icon size={18} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <div className="text-[11px]" style={{ color: '#475569' }}>Powered by Langfuse</div>
        <div className="text-[11px]" style={{ color: '#475569' }}>Built by Trigent AI</div>
      </div>
    </aside>
  )
}
