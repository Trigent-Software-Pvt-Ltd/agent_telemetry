'use client'

import { useState } from 'react'
import { ROI_SNAPSHOTS } from '@/lib/mock-data'
import { CostSlider } from '@/components/roi/CostSlider'
import { RoiSummaryCards } from '@/components/roi/RoiSummaryCards'
import { WaterfallChart } from '@/components/roi/WaterfallChart'
import { ProcessComparison } from '@/components/roi/ProcessComparison'
import { HonestNote } from '@/components/roi/HonestNote'

export default function RoiCalculatorPage() {
  const [manualCost, setManualCost] = useState(50)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-sora)]">ROI Calculator</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Calculate and compare return on investment across processes.
        </p>
      </div>

      {/* Slider */}
      <CostSlider value={manualCost} onChange={setManualCost} />

      {/* Summary cards */}
      <RoiSummaryCards snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

      {/* Waterfall chart */}
      <WaterfallChart snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

      {/* Process comparison table */}
      <ProcessComparison snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

      {/* Honest note */}
      <HonestNote />
    </div>
  )
}
