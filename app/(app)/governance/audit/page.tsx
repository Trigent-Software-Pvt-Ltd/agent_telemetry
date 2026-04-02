'use client'

import { AuditSummary } from '@/components/governance/AuditSummary'
import { AuditAlert } from '@/components/governance/AuditAlert'
import { AuditTable } from '@/components/governance/AuditTable'
import { AuditFilters } from '@/components/governance/AuditFilters'
import { OverrideTrendChart } from '@/components/governance/OverrideTrendChart'
import { OverrideCorrelation } from '@/components/governance/OverrideCorrelation'
import { getOverrideTrends } from '@/lib/mock-data'
import { Download } from 'lucide-react'

const overrideTrends = getOverrideTrends()

export default function AuditLogPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-sora)]">
            Human Oversight Audit Log
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            ISO/IEC 42001 compliance record &middot; EU AI Act Article 14
          </p>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--status-green)' }}>
            93% of collaborative decisions have a human audit trail
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-all cursor-pointer no-print"
          style={{ background: '#D4AF37', color: '#0A1628' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#A8891A'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#D4AF37'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <Download size={16} />
          Export for audit (PDF)
        </button>
      </div>

      {/* Summary cards */}
      <AuditSummary />

      {/* Alert */}
      <AuditAlert />

      {/* Override Trend Analysis */}
      <OverrideTrendChart trends={overrideTrends} />

      {/* Correlation Insight */}
      <OverrideCorrelation trends={overrideTrends} />

      {/* Filters */}
      <div className="no-print">
        <AuditFilters />
      </div>

      {/* Table */}
      <AuditTable />
    </div>
  )
}
