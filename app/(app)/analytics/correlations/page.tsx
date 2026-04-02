'use client'

import { CorrelationCard } from '@/components/dashboard/CorrelationCard'
import { CorrelationSummary } from '@/components/dashboard/CorrelationSummary'
import { getCorrelations } from '@/lib/mock-data'
import { Waypoints } from 'lucide-react'

export default function CorrelationsPage() {
  const correlations = getCorrelations()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Waypoints size={20} style={{ color: '#D4AF37' }} />
          <h1 className="text-lg font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Correlation Engine
          </h1>
        </div>
        <span className="text-xs" style={{ color: '#94A3B8' }}>
          Auto-discovered patterns &middot; Last updated 2h ago
        </span>
      </div>

      {/* Summary Cards */}
      <CorrelationSummary correlations={correlations} />

      {/* Correlation Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {correlations.map((c) => (
          <CorrelationCard key={c.id} correlation={c} />
        ))}
      </div>
    </div>
  )
}
