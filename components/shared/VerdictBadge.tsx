import { Verdict } from '@/types/telemetry'

const config = {
  GREEN: { bg: '#059669', icon: '✓', label: 'GREEN' },
  AMBER: { bg: '#D97706', icon: '~', label: 'AMBER' },
  RED:   { bg: '#DC2626', icon: '✗', label: 'RED' },
}

export function VerdictBadge({ verdict, size = 'md' }: { verdict: Verdict; size?: 'sm' | 'md' | 'lg' }) {
  const c = config[verdict]
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-[var(--font-sora)] font-bold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: c.bg }}
    >
      <span>{c.icon}</span>
      <span>{c.label}</span>
    </span>
  )
}
