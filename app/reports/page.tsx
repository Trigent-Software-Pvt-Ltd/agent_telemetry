'use client'

import { WORKFLOWS, computeSummary } from '@/lib/mock-data'
import { generateRecommendations } from '@/lib/verdict-logic'
import { Sidebar } from '@/components/layout/Sidebar'
import { VerdictBadge } from '@/components/shared/VerdictBadge'
import { toast } from 'sonner'
import { Download, FileText } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'

export default function ReportsPage() {
  const workflow = WORKFLOWS[0]
  const summary = computeSummary(workflow.id)
  const recs = generateRecommendations(workflow.id, summary.verdict, summary.sla_hit_rate, summary.success_rate)

  const roiData = [
    { name: 'Total Value', value: summary.total_value, color: '#059669' },
    { name: 'Total Cost', value: summary.total_cost, color: '#DC2626' },
  ]

  const handleExport = (type: string) => {
    toast.info(`${type} export will be live in the production build — this is your preview.`)
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              Performance Report
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('PDF')}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold cursor-pointer transition-all"
                style={{ background: '#D4AF37', color: '#0A1628' }}
              >
                <Download size={16} /> Download PDF
              </button>
              <button
                onClick={() => handleExport('PPT')}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold cursor-pointer transition-all"
                style={{ background: '#E8EEF5', color: '#0A1628' }}
              >
                <FileText size={16} /> Download PPT
              </button>
            </div>
          </div>

          {/* Panel 1: Executive Verdict */}
          <div className="card">
            <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Executive Verdict
            </h2>
            <div className="flex items-center gap-4 mb-3">
              <VerdictBadge verdict={summary.verdict} size="lg" />
              <span className="text-base font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                {workflow.name}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#0A1628' }}>
              {summary.verdict_text}
            </p>
            <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
              Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Panel 2: Performance Overview */}
          <div className="card">
            <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Performance Overview
            </h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Runs', value: String(summary.total_runs) },
                { label: 'Success Rate', value: `${Math.round(summary.success_rate * 100)}%` },
                { label: 'Avg Cost', value: `$${summary.avg_cost.toFixed(6)}` },
                { label: 'P95 Latency', value: `${summary.p95_duration_ms}ms` },
              ].map(item => (
                <div key={item.label} className="text-center p-3 rounded-lg" style={{ background: '#F7F9FC' }}>
                  <div className="text-xl font-bold tabular-nums font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                    {item.value}
                  </div>
                  <div className="text-[10px] uppercase font-semibold mt-1" style={{ color: '#64748B' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: ROI Summary */}
          <div className="card">
            <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              ROI Summary
            </h2>
            <div className="flex items-center gap-6">
              <div style={{ width: 300, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {roiData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="text-sm mb-2">
                  <span style={{ color: '#64748B' }}>Total Value Delivered: </span>
                  <span className="font-bold font-[var(--font-sora)]" style={{ color: '#059669' }}>
                    ${summary.total_value.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm mb-2">
                  <span style={{ color: '#64748B' }}>Total Cost: </span>
                  <span className="font-bold font-[var(--font-mono-jb)]" style={{ color: '#DC2626' }}>
                    ${summary.total_cost.toFixed(6)}
                  </span>
                </div>
                <div className="text-sm font-bold" style={{ color: summary.roi_positive ? '#059669' : '#DC2626' }}>
                  {summary.roi_positive ? '\u2191 ROI Positive' : '\u2193 ROI Negative'}
                </div>
              </div>
            </div>
          </div>

          {/* Panel 4: Recommendations */}
          <div className="card">
            <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Recommendations
            </h2>
            <ul className="space-y-3">
              {recs.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" style={{ background: '#FBF5DC', color: '#A8891A' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm" style={{ color: '#0A1628' }}>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
