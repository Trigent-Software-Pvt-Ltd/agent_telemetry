'use client'

import { use } from 'react'
import { WORKFLOWS, generateRuns, computeSummary } from '@/lib/mock-data'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { VerdictCard } from '@/components/dashboard/VerdictCard'
import { StatBanner } from '@/components/dashboard/StatBanner'
import { TraceViewer } from '@/components/workflow/TraceViewer'

export default function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const workflow = WORKFLOWS.find(w => w.id === id)

  if (!workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F7F9FC' }}>
        <p className="text-lg" style={{ color: '#64748B' }}>Workflow not found</p>
      </div>
    )
  }

  const summary = computeSummary(id)
  const runs = generateRuns(id)

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>
        <TopBar activeWorkflowId={id} onWorkflowChange={() => {}} showWorkflowSelector={false} />
        <div className="p-6 flex flex-col gap-6">
          <VerdictCard summary={summary} workflow={workflow} />
          <StatBanner summary={summary} />
          <TraceViewer runs={runs} sla_ms={summary.sla_ms} />
        </div>
      </div>
    </div>
  )
}
