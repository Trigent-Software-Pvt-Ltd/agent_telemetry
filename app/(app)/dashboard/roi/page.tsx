'use client'

import { useState } from 'react'
import { ROI_SNAPSHOTS, PROCESSES, getMonthlyCosts } from '@/lib/mock-data'
import { CostSlider } from '@/components/roi/CostSlider'
import { RoiSummaryCards } from '@/components/roi/RoiSummaryCards'
import { WaterfallChart } from '@/components/roi/WaterfallChart'
import { ProcessComparison } from '@/components/roi/ProcessComparison'
import { HonestNote } from '@/components/roi/HonestNote'
import CostTrendChart from '@/components/dashboard/CostTrendChart'
import AgentCostBreakdown from '@/components/dashboard/AgentCostBreakdown'
import CostMetricCards from '@/components/dashboard/CostMetricCards'
import { PaybackTimeline } from '@/components/roi/PaybackTimeline'
import TcoBreakdown from '@/components/roi/TcoBreakdown'
import LongRangeProjection from '@/components/roi/LongRangeProjection'

type TabId = 'roi' | 'costs' | 'payback' | 'tco' | 'projection'

export default function FinancialImpactPage() {
  const [activeTab, setActiveTab] = useState<TabId>('roi')
  const [manualCost, setManualCost] = useState(50)
  const [selectedProcess, setSelectedProcess] = useState<string>('')

  const costData = getMonthlyCosts(selectedProcess || undefined)

  const tabs: { id: TabId; label: string }[] = [
    { id: 'roi', label: 'ROI Summary' },
    { id: 'costs', label: 'Inference Costs' },
    { id: 'payback', label: 'Payback' },
    { id: 'tco', label: 'TCO' },
    { id: 'projection', label: '3-Year' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          Financial Impact
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          ROI analysis, cost breakdowns, and inference spend tracking.
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="inline-flex rounded-lg p-1 self-start"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer"
            style={{
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'roi' && (
        <>
          {/* Slider */}
          <CostSlider value={manualCost} onChange={setManualCost} />

          {/* Summary cards — Net ROI is already last in the component, but we lead with a hero card */}
          <NetRoiHero snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

          {/* Detailed breakdown cards */}
          <RoiSummaryCards snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

          {/* Waterfall chart */}
          <WaterfallChart snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

          {/* Process comparison table */}
          <ProcessComparison snapshots={ROI_SNAPSHOTS} manualCost={manualCost} />

          {/* Honest note */}
          <HonestNote />
        </>
      )}

      {activeTab === 'costs' && (
        <>
          {/* Process filter */}
          <div className="flex justify-end">
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="text-sm rounded-lg px-3 py-2"
              style={{
                border: '1px solid var(--vip-border)',
                background: '#FFFFFF',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-dm)',
                minWidth: 200,
              }}
            >
              <option value="">All Processes</option>
              {PROCESSES.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Cost efficiency metric cards */}
          <CostMetricCards data={costData} />

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CostTrendChart data={costData} />
            <AgentCostBreakdown data={costData} />
          </div>
        </>
      )}

      {activeTab === 'payback' && (
        <PaybackTimeline />
      )}

      {activeTab === 'tco' && <TcoBreakdown />}

      {activeTab === 'projection' && <LongRangeProjection />}
    </div>
  )
}

/* Hero card showing Net Weekly ROI prominently */
function NetRoiHero({
  snapshots,
  manualCost,
}: {
  snapshots: typeof ROI_SNAPSHOTS
  manualCost: number
}) {
  const totals = snapshots.reduce(
    (acc, s) => {
      const ratio = manualCost / s.manualCostPerTask
      const gross = s.grossSavingWeekly * ratio
      const agentCost = s.inferenceCostWeekly + s.oversightCostWeekly + s.governanceOverheadWeekly
      const net = gross - agentCost
      acc.gross += gross
      acc.agentCost += agentCost
      acc.net += net
      return acc
    },
    { gross: 0, agentCost: 0, net: 0 },
  )

  const isPositive = totals.net >= 0

  return (
    <div
      className="card animate-fade-up flex items-center gap-5"
      style={{
        background: isPositive ? 'var(--status-green-bg)' : 'var(--status-red-bg)',
        border: `1px solid ${isPositive ? 'var(--status-green)' : 'var(--status-red)'}`,
      }}
    >
      <div>
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{ color: 'var(--text-secondary)' }}
        >
          Net Weekly ROI
        </div>
        <div
          className="text-3xl font-bold tabular-nums font-[var(--font-sora)]"
          style={{ color: isPositive ? 'var(--status-green)' : 'var(--status-red)' }}
        >
          ${Math.round(totals.net).toLocaleString()}/wk
        </div>
        <div className="flex gap-4 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <span>Gross savings: <span className="font-semibold">${Math.round(totals.gross).toLocaleString()}/wk</span></span>
          <span>Agent costs: <span className="font-semibold">${Math.round(totals.agentCost).toLocaleString()}/wk</span></span>
        </div>
      </div>
    </div>
  )
}
