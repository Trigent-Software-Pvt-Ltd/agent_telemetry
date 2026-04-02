'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { getAlertHistory, AlertHistoryEntry } from '@/lib/mock-data'
import { CheckCircle, Eye } from 'lucide-react'

const SEVERITY_STYLES: Record<string, { bg: string; color: string }> = {
  Critical: { bg: '#FFF5F5', color: '#DC2626' },
  Warning: { bg: '#FFFBEB', color: '#D97706' },
  Info: { bg: '#E8EEF5', color: '#64748B' },
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Active: { bg: '#FFF5F5', color: '#DC2626' },
  Acknowledged: { bg: '#FFFBEB', color: '#D97706' },
  Resolved: { bg: '#ECFDF5', color: '#059669' },
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diffH = Math.floor((now - d.getTime()) / (3600 * 1000))
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ago`
}

export function AlertHistory() {
  const [alerts, setAlerts] = useState<AlertHistoryEntry[]>(() => getAlertHistory())

  const handleAcknowledge = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' as const } : a)
    )
    toast.success('Alert acknowledged')
  }

  const handleResolve = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'Resolved' as const } : a)
    )
    toast.success('Alert resolved')
  }

  return (
    <section>
      <div className="mb-4">
        <h2
          className="text-xs font-semibold uppercase"
          style={{ color: '#64748B', letterSpacing: '0.08em' }}
        >
          Alert History
        </h2>
        <p className="text-[12px] mt-1" style={{ color: '#94A3B8' }}>
          Recent alert events across all monitored agents.
        </p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#F7F9FC', borderBottom: '1px solid #E2E8F0' }}>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Time</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Type</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Agent</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Severity</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Message</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.06em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(alert => {
              const sevStyle = SEVERITY_STYLES[alert.severity]
              const statStyle = STATUS_STYLES[alert.status]
              return (
                <tr
                  key={alert.id}
                  className="row-hover"
                  style={{ borderBottom: '1px solid #E2E8F0' }}
                >
                  <td className="px-4 py-3 text-[12px] font-[var(--font-mono-jb)] whitespace-nowrap" style={{ color: '#64748B' }}>
                    {formatTimestamp(alert.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-[12px] font-medium" style={{ color: '#0A1628' }}>
                    {alert.type}
                  </td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: '#0A1628' }}>
                    {alert.agent}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: sevStyle.bg, color: sevStyle.color }}
                    >
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: statStyle.bg, color: statStyle.color }}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] max-w-[280px]" style={{ color: '#64748B' }}>
                    {alert.message}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {alert.status === 'Active' && (
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-[11px] font-medium px-2 py-1 rounded cursor-pointer transition-colors"
                          style={{ color: '#D97706', background: '#FFFBEB' }}
                          title="Acknowledge"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="text-[11px] font-medium px-2 py-1 rounded cursor-pointer transition-colors"
                          style={{ color: '#059669', background: '#ECFDF5' }}
                          title="Resolve"
                        >
                          <CheckCircle size={14} />
                        </button>
                      </div>
                    )}
                    {alert.status === 'Acknowledged' && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="text-[11px] font-medium px-2 py-1 rounded cursor-pointer transition-colors"
                        style={{ color: '#059669', background: '#ECFDF5' }}
                        title="Resolve"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {alert.status === 'Resolved' && (
                      <span className="text-[11px]" style={{ color: '#94A3B8' }}>--</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
