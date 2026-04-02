import type { Verdict } from '@/types/telemetry'

const config: Record<Verdict, { bg: string; icon: string; label: string }> = {
  GREEN: { bg: '#1D9E75', icon: '\u2713', label: 'GREEN' },
  AMBER: { bg: '#BA7517', icon: '~', label: 'AMBER' },
  RED:   { bg: '#E24B4A', icon: '\u2717', label: 'RED' },
}

export function VerdictBadge({ verdict, size = 'md' }: { verdict: Verdict; size?: 'sm' | 'md' | 'lg' }) {
  const c = config[verdict]
  const sizeClasses: Record<string, string> = {
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
