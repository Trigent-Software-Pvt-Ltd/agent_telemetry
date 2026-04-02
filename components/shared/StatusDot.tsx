'use client'

import clsx from 'clsx'
import type { Status } from '@/types/telemetry'

export function StatusDot({ status, size = 8 }: { status: Status; size?: number }) {
  const colors: Record<Status, { bg: string; className: string }> = {
    green: { bg: '#1D9E75', className: 'status-dot-green' },
    amber: { bg: '#BA7517', className: 'status-dot-amber' },
    red: { bg: '#E24B4A', className: 'status-dot-red' },
  }
  const c = colors[status]
  return (
    <span
      className={clsx('inline-block rounded-full', c.className)}
      style={{ width: size, height: size, backgroundColor: c.bg }}
    />
  )
}
