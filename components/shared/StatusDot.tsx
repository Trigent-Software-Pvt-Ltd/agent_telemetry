'use client'

import clsx from 'clsx'

export function StatusDot({ status, size = 8 }: { status: 'green' | 'amber' | 'red'; size?: number }) {
  const colors = {
    green: { bg: '#059669', className: 'status-dot-green' },
    amber: { bg: '#D97706', className: 'status-dot-amber' },
    red: { bg: '#DC2626', className: 'status-dot-red' },
  }
  const c = colors[status]
  return (
    <span
      className={clsx('inline-block rounded-full', c.className)}
      style={{ width: size, height: size, backgroundColor: c.bg }}
    />
  )
}
