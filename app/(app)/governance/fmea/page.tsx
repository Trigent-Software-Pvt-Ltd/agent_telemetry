'use client'

import { useState } from 'react'
import type { FmeaEntry } from '@/types/telemetry'
import { RiskSummary } from '@/components/fmea/RiskSummary'
import { RiskHeatmap } from '@/components/fmea/RiskHeatmap'
import { FmeaDetailPanel } from '@/components/fmea/FmeaDetailPanel'
import { RiskTable } from '@/components/fmea/RiskTable'
import { ShieldAlert } from 'lucide-react'

export default function FmeaRiskBoardPage() {
  const [selectedEntry, setSelectedEntry] = useState<FmeaEntry | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={22} style={{ color: 'var(--status-red)' }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            FMEA Risk Board
          </h1>
        </div>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Failure Mode and Effects Analysis — ISO/IEC 42001 risk assessment framework
        </p>
      </div>

      {/* Summary cards */}
      <RiskSummary />

      {/* Two-column: Heatmap + Detail */}
      <div className="grid grid-cols-2 gap-4">
        <RiskHeatmap
          selectedId={selectedEntry?.id ?? null}
          onSelect={setSelectedEntry}
        />
        <FmeaDetailPanel entry={selectedEntry} />
      </div>

      {/* Full-width table */}
      <RiskTable
        selectedId={selectedEntry?.id ?? null}
        onSelect={setSelectedEntry}
      />
    </div>
  )
}
