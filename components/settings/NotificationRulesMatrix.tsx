'use client'

import { useState } from 'react'
import { getNotificationRules, NotificationRule } from '@/lib/mock-data'
import { Bell } from 'lucide-react'

export function NotificationRulesMatrix() {
  const [rules, setRules] = useState<NotificationRule[]>(getNotificationRules)

  const toggleChannel = (ruleId: string, channel: 'email' | 'slack' | 'teams') => {
    setRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? { ...r, channels: { ...r.channels, [channel]: !r.channels[channel] } }
          : r
      )
    )
  }

  const channelHeaders = [
    { key: 'email' as const, label: 'Email' },
    { key: 'slack' as const, label: 'Slack' },
    { key: 'teams' as const, label: 'Teams' },
  ]

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} style={{ color: '#D4AF37' }} />
        <h2 className="text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Notification Rules
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <th
                className="text-left py-2 px-3 text-[10px] font-semibold uppercase"
                style={{ color: '#94A3B8', letterSpacing: '0.08em' }}
              >
                Alert Type
              </th>
              <th
                className="text-left py-2 px-3 text-[10px] font-semibold uppercase"
                style={{ color: '#94A3B8', letterSpacing: '0.08em' }}
              >
                Recipients
              </th>
              {channelHeaders.map(ch => (
                <th
                  key={ch.key}
                  className="text-center py-2 px-3 text-[10px] font-semibold uppercase"
                  style={{ color: '#94A3B8', letterSpacing: '0.08em', width: 80 }}
                >
                  {ch.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id} className="row-hover" style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td className="py-3 px-3">
                  <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>{rule.alertType}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: '#94A3B8' }}>{rule.description}</div>
                </td>
                <td className="py-3 px-3 text-xs" style={{ color: '#64748B' }}>
                  {rule.recipients}
                </td>
                {channelHeaders.map(ch => (
                  <td key={ch.key} className="py-3 px-3 text-center">
                    <label className="inline-flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.channels[ch.key]}
                        onChange={() => toggleChannel(rule.id, ch.key)}
                        className="w-4 h-4 rounded accent-[#D4AF37] cursor-pointer"
                      />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
