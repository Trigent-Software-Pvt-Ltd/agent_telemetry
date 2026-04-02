'use client'

import { OversightSummary } from '@/components/governance/OversightSummary'
import { OversightGapTable } from '@/components/governance/OversightGapTable'
import { getOversightGaps } from '@/lib/mock-data'
import { ShieldAlert } from 'lucide-react'

const gaps = getOversightGaps()

export default function OversightGapReportPage() {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--status-amber)', color: '#fff' }}
        >
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-sora)]">
            Unreviewed Decisions
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tasks where AI operates without human review
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            ISO/IEC 42001 &middot; Autonomous tasks require documented risk acceptance or review gates
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <OversightSummary gaps={gaps} />

      {/* Gap table */}
      <OversightGapTable gaps={gaps} />
    </div>
  )
}
