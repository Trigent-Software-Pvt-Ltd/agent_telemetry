'use client'

import { Download } from 'lucide-react'
import type { ReportConfig } from '@/types/telemetry'

interface ReportHistoryProps {
  reports: ReportConfig[]
  onDownload: (report: ReportConfig) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function StatusPill({ status }: { status: 'ready' | 'generating' }) {
  const isReady = status === 'ready'
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{
        background: isReady ? 'var(--status-green-bg)' : 'var(--status-amber-bg)',
        color: isReady ? 'var(--status-green)' : 'var(--status-amber)',
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: 6, height: 6,
          backgroundColor: isReady ? 'var(--status-green)' : 'var(--status-amber)',
        }}
      />
      {isReady ? 'Ready' : 'Generating'}
    </span>
  )
}

const PROCESS_LABELS: Record<string, string> = {
  'sports-betting': 'Sports Betting',
  'customer-service': 'Customer Service',
}

export function ReportHistory({ reports, onDownload }: ReportHistoryProps) {
  if (reports.length === 0) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold mb-3">Report History</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reports generated yet.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold mb-4">Report History</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Report</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date Range</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Processes</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Format</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Generated</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-right py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-3 pr-4 font-medium">{report.name}</td>
                <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>{report.dateRange}</td>
                <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>
                  {report.processes.map(p => PROCESS_LABELS[p] || p).join(', ')}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-medium uppercase"
                    style={{ background: 'var(--accent-blue-bg)', color: 'var(--accent-blue)' }}
                  >
                    {report.format}
                  </span>
                </td>
                <td className="py-3 pr-4" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(report.generatedAt)}
                </td>
                <td className="py-3 pr-4">
                  <StatusPill status={report.status} />
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => onDownload(report)}
                    disabled={report.status !== 'ready'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={{
                      border: '1px solid var(--border)',
                      background: report.status === 'ready' ? '#FFFFFF' : 'var(--surface)',
                      color: report.status === 'ready' ? 'var(--text-primary)' : 'var(--text-muted)',
                      opacity: report.status === 'ready' ? 1 : 0.5,
                    }}
                  >
                    <Download size={12} />
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
