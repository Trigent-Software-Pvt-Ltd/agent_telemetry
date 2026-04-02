'use client'

import { useState } from 'react'
import { PROCESSES, getMonthlyCosts } from '@/lib/mock-data'
import CostTrendChart from '@/components/dashboard/CostTrendChart'
import AgentCostBreakdown from '@/components/dashboard/AgentCostBreakdown'
import CostMetricCards from '@/components/dashboard/CostMetricCards'

export default function CostDashboardPage() {
  const [selectedProcess, setSelectedProcess] = useState<string>('')

  const costData = getMonthlyCosts(selectedProcess || undefined)

  return (
    <div className="flex flex-col gap-5">
      {/* Page header with process filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
          >
            Cost Analysis
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Inference spend trends, per-agent breakdowns, and efficiency metrics.
          </p>
        </div>

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
    </div>
  )
}
