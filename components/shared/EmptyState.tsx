import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{ width: 56, height: 56, background: 'var(--surface)' }}
      >
        <Icon size={28} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3
        className="text-sm font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm max-w-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: 'var(--accent-blue)',
            color: '#FFFFFF',
          }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
