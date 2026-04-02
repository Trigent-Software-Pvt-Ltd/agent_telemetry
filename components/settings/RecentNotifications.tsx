'use client'

import { getRecentNotifications } from '@/lib/mock-data'
import { Clock, Mail, MessageSquare, Monitor } from 'lucide-react'

const channelIcons: Record<string, typeof Mail> = {
  email: Mail,
  slack: MessageSquare,
  teams: Monitor,
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  delivered: { bg: '#ECFDF5', text: '#059669' },
  failed: { bg: '#FFF5F5', text: '#DC2626' },
  pending: { bg: '#FFFBEB', text: '#D97706' },
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RecentNotifications() {
  const notifications = getRecentNotifications()

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} style={{ color: '#D4AF37' }} />
        <h2 className="text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Recent Notifications
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              {['Timestamp', 'Type', 'Channel', 'Recipient', 'Status', 'Message'].map(h => (
                <th
                  key={h}
                  className="text-left py-2 px-3 text-[10px] font-semibold uppercase"
                  style={{ color: '#94A3B8', letterSpacing: '0.08em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => {
              const ChannelIcon = channelIcons[n.channel] ?? Mail
              const ss = statusStyles[n.status]
              return (
                <tr key={n.id} className="row-hover" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td className="py-2.5 px-3 text-xs font-[var(--font-mono-jb)]" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(n.timestamp)}
                  </td>
                  <td className="py-2.5 px-3 text-sm font-medium" style={{ color: '#0A1628' }}>
                    {n.type}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <ChannelIcon size={14} style={{ color: '#64748B' }} />
                      <span className="text-xs capitalize" style={{ color: '#64748B' }}>{n.channel}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>
                    {n.recipient}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                      style={{ background: ss.bg, color: ss.text, letterSpacing: '0.04em' }}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#0A1628', maxWidth: 280 }}>
                    <span className="line-clamp-1">{n.message}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
