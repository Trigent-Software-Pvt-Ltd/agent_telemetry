'use client'

import { Shield, AlertTriangle, XCircle } from 'lucide-react'

interface Props {
  status: 'operational' | 'degraded' | 'down'
  label: string
}

const STATUS_CONFIG = {
  operational: { icon: Shield, bg: 'rgba(5,150,105,0.15)', border: '#059669', color: '#059669' },
  degraded:    { icon: AlertTriangle, bg: 'rgba(217,119,6,0.15)', border: '#D97706', color: '#D97706' },
  down:        { icon: XCircle, bg: 'rgba(220,38,38,0.15)', border: '#DC2626', color: '#DC2626' },
}

export function SystemHealthBanner({ status, label }: Props) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 rounded-xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon size={20} style={{ color: cfg.color }} />
      <span className="text-sm font-semibold" style={{ color: cfg.color }}>
        {label}
      </span>
    </div>
  )
}
