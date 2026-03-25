'use client'

import { WORKFLOWS, computeSummary } from '@/lib/mock-data'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { WorkflowCard } from '@/components/workflow/WorkflowCard'

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>
        <TopBar activeWorkflowId="odds-analysis-agent" onWorkflowChange={() => {}} showWorkflowSelector={false} />
        <div className="p-6">
          <h1 className="text-xl font-bold font-[var(--font-sora)] mb-6" style={{ color: '#0A1628' }}>
            All Workflows
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {WORKFLOWS.map(w => (
              <WorkflowCard key={w.id} workflow={w} summary={computeSummary(w.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
