'use client'

import { Run } from '@/types/telemetry'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface RecentRunsProps {
  runs: Run[]
  sla_ms: number
  workflowId: string
}

export function RecentRuns({ runs, sla_ms, workflowId }: RecentRunsProps) {
  const recent = runs.slice(0, 20)

  return (
    <div className="card">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
        Recent Runs
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
              <th className="text-left py-2 px-3 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Run ID</th>
              <th className="text-left py-2 px-3 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Timestamp</th>
              <th className="text-left py-2 px-3 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Duration</th>
              <th className="text-left py-2 px-3 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Cost</th>
              <th className="text-left py-2 px-3 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Outcome</th>
              <th className="text-left py-2 px-3 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Model</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(run => (
              <tr
                key={run.run_id}
                className="row-hover cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid #E2E8F0' }}
              >
                <td className="py-2.5 px-3 font-[var(--font-mono-jb)] text-xs font-medium" style={{ color: '#0A1628' }}>
                  <Link href={`/workflows/${workflowId}`} className="hover:underline">
                    {run.run_id}
                  </Link>
                </td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>
                  {new Date(run.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2.5 px-3 text-xs font-[var(--font-mono-jb)]">
                  <span style={{ color: run.duration_ms <= sla_ms ? '#059669' : '#DC2626' }}>
                    {run.duration_ms.toLocaleString()}ms
                  </span>
                </td>
                <td className="py-2.5 px-3 text-xs font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
                  ${run.total_cost.toFixed(6)}
                </td>
                <td className="py-2.5 px-3">
                  {run.outcome ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#ECFDF5', color: '#059669' }}>
                      <CheckCircle size={12} /> Pass
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FFF5F5', color: '#DC2626' }}>
                      <XCircle size={12} /> Fail
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs" style={{ color: '#64748B' }}>
                  {run.model}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
