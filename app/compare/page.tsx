'use client'

import { WORKFLOWS, computeSummary } from '@/lib/mock-data'
import { generateRecommendations } from '@/lib/verdict-logic'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ComparisonMatrix } from '@/components/compare/ComparisonMatrix'
import { VerdictBadge } from '@/components/shared/VerdictBadge'

export default function ComparePage() {
  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>
        <TopBar activeWorkflowId="odds-analysis-agent" onWorkflowChange={() => {}} showWorkflowSelector={false} />
        <div className="p-6 flex flex-col gap-6">
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Cross-Workflow Comparison
          </h1>
          <ComparisonMatrix />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {WORKFLOWS.map(w => {
              const s = computeSummary(w.id)
              const recs = generateRecommendations(w.id, s.verdict, s.sla_hit_rate, s.success_rate)
              return (
                <div key={w.id} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
                      {w.name}
                    </h3>
                    <VerdictBadge verdict={s.verdict} size="sm" />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
                    {recs[0]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
