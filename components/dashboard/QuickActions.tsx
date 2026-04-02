import Link from 'next/link'

const actions = [
  {
    label: 'Generate Board Report',
    href: '/dashboard/export',
    description: 'Export executive summary for stakeholders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 6h6M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Compare Agents',
    href: '/agents/compare',
    description: 'Side-by-side performance comparison',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <rect x="12" y="4" width="6" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10 7v6M8.5 8.5L10 7l1.5 1.5M8.5 11.5L10 13l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'View Live Monitor',
    href: '/monitoring',
    description: 'Real-time agent activity and alerts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 18h8M10 15v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M6 9h2l1.5-3 2 6L13 9h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="card flex items-center gap-3 transition-colors hover:bg-[var(--surface)]"
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}
          >
            {action.icon}
          </div>
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
            >
              {action.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {action.description}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
