'use client'

import Image from 'next/image'
import { Printer } from 'lucide-react'
import type { getDay5ReportData } from '@/lib/quadrant-mock'

type Data = ReturnType<typeof getDay5ReportData>

export default function Day5ReportView({ data }: { data: Data }) {
  const decisionColor =
    data.recommendation.decision === 'yes'
      ? '#1D9E75'
      : data.recommendation.decision === 'no'
        ? '#E24B4A'
        : '#F59E0B'
  const decisionLabel =
    data.recommendation.decision === 'yes'
      ? 'Extend engagement — YES'
      : data.recommendation.decision === 'no'
        ? 'Do not extend — NO'
        : 'Extend — CONDITIONAL'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 no-print">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)' }}>
            Day-5 Decision Report
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Auto-generated from CoS telemetry + Sourcing Agent results. Print-ready.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
          style={{ background: '#378ADD' }}
        >
          <Printer size={14} /> Print / Save PDF
        </button>
      </div>

      <div className="card p-8 print-report" style={{ minHeight: 800 }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Image src="/quadrant-logo.png" alt="Quadrant" width={180} height={44} style={{ objectFit: 'contain' }} />
          <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
            Quadrant × FuzeBox.AI · Delivered by Trigent
            <br />
            Generated {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <h2 className="text-xl font-bold mt-6" style={{ fontFamily: 'var(--font-sora)' }}>
          5-Day Engagement — Go / No-Go Decision Report
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Summary of Chief of Staff telemetry and Sourcing Agent evaluation for the 5-day sprint with Quadrant
          Two Capital Partners.
        </p>

        {/* Decision box */}
        <div
          className="mt-6 p-5 rounded-lg"
          style={{ background: decisionColor + '12', border: `1px solid ${decisionColor}` }}
        >
          <div className="text-xs uppercase tracking-wider" style={{ color: decisionColor }}>
            Recommendation
          </div>
          <div className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)', color: decisionColor }}>
            {decisionLabel}
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            {data.recommendation.narrative}
          </p>
          <div className="text-xs mt-3 italic" style={{ color: 'var(--text-muted)' }}>
            Signed: {data.recommendation.signedBy}
          </div>
        </div>

        {/* Morning ritual */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            1 — Morning ritual baseline
          </h3>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>
              <tr className="text-left">
                <th className="py-1">User</th>
                <th className="py-1">Median open delay</th>
                <th className="py-1">Open rate</th>
                <th className="py-1">Briefings</th>
              </tr>
            </thead>
            <tbody>
              {data.morningRitual.map(r => (
                <tr key={r.userId} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="py-1.5">{r.userName}</td>
                  <td className="py-1.5 font-mono">
                    {r.medianMinutesToOpen !== null ? `${Math.round(r.medianMinutesToOpen)}m` : '—'}
                  </td>
                  <td className="py-1.5">{Math.round(r.openRate * 100)}%</td>
                  <td className="py-1.5">{r.briefingsTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Action rate */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            2 — Card action rates by user
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {data.actionRates.map(a => (
              <div key={a.user} className="p-3 rounded" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.user}</div>
                <div className="text-xl font-bold mt-0.5" style={{ fontFamily: 'var(--font-sora)' }}>
                  {Math.round(a.rate * 100)}%
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {a.acted} / {a.total} cards
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top 3 prompt improvements */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            3 — Top 3 improvement opportunities in the prompt
          </h3>
          <ol className="text-sm space-y-1 list-decimal pl-5" style={{ color: 'var(--text-secondary)' }}>
            {data.topPromptOpportunities.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ol>
        </section>

        {/* Sourcing */}
        <section className="mt-6">
          <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            4 — Sourcing Agent results
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <ReportStat label="Surfaced" value={data.sourcing.surfacedCount.toString()} />
            <ReportStat label="Reviewed" value={data.sourcing.reviewedCount.toString()} />
            <ReportStat label="Good fit" value={data.sourcing.goodFitCount.toString()} color="#1D9E75" />
            <ReportStat label="Poor fit" value={data.sourcing.poorFitCount.toString()} color="#E24B4A" />
          </div>
        </section>

        <div className="mt-10 pt-4 border-t text-[10px] flex items-center justify-between" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <span>Confidential — Quadrant × FuzeBox.AI — Delivered by Trigent</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  )
}

function ReportStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-3 rounded" style={{ background: 'var(--surface-muted, #F7F9FC)' }}>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div
        className="text-xl font-bold mt-0.5"
        style={{ fontFamily: 'var(--font-sora)', color: color || 'var(--text-primary)' }}
      >
        {value}
      </div>
    </div>
  )
}
