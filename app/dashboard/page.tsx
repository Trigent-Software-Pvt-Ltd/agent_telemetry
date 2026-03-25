'use client'

import { useState } from 'react'
import { WorkflowContext } from '@/hooks/useWorkflow'
import { WORKFLOWS, generateRuns, computeSummary } from '@/lib/mock-data'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { VerdictCard } from '@/components/dashboard/VerdictCard'
import { StatBanner } from '@/components/dashboard/StatBanner'
import { SuccessGauge } from '@/components/dashboard/SuccessGauge'
import { LatencyChart } from '@/components/dashboard/LatencyChart'
import { RunTimeline } from '@/components/dashboard/RunTimeline'
import { CostBreakdown } from '@/components/dashboard/CostBreakdown'
import { RecentRuns } from '@/components/dashboard/RecentRuns'

export default function DashboardPage() {
  const [activeWorkflowId, setActiveWorkflowId] = useState('odds-analysis-agent')

  const workflow = WORKFLOWS.find(w => w.id === activeWorkflowId)!
  const summary = computeSummary(activeWorkflowId)
  const runs = generateRuns(activeWorkflowId)

  return (
    <WorkflowContext.Provider value={{ activeWorkflowId, setActiveWorkflowId }}>
      <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
        <Sidebar />
        <div style={{ marginLeft: 240 }}>
          <TopBar activeWorkflowId={activeWorkflowId} onWorkflowChange={setActiveWorkflowId} />
          <div className="p-6 flex flex-col gap-6">
            <VerdictCard key={`verdict-${activeWorkflowId}`} summary={summary} workflow={workflow} />
            <StatBanner key={`banner-${activeWorkflowId}`} summary={summary} />
            <div className="flex gap-6">
              <div className="w-[35%]">
                <SuccessGauge rate={summary.success_rate} verdict={summary.verdict} />
              </div>
              <div className="w-[65%]">
                <LatencyChart runs={runs} sla_ms={summary.sla_ms} p50={summary.p50_duration_ms} p90={summary.p90_duration_ms} p95={summary.p95_duration_ms} />
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-[60%]">
                <RunTimeline runs={runs} sla_ms={summary.sla_ms} />
              </div>
              <div className="w-[40%]">
                <CostBreakdown agentCosts={summary.agent_costs} />
              </div>
            </div>
            <RecentRuns runs={runs} sla_ms={summary.sla_ms} workflowId={activeWorkflowId} />
          </div>
        </div>
      </div>
    </WorkflowContext.Provider>
  )
}
