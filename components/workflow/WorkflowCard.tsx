'use client'

import { Workflow, WorkflowSummary } from '@/types/telemetry'
import { VerdictBadge } from '@/components/shared/VerdictBadge'
import { generateSparkline } from '@/lib/mock-data'
import { ResponsiveContainer, LineChart, Line } from 'recharts'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface WorkflowCardProps {
  workflow: Workflow
  summary: WorkflowSummary
}

export function WorkflowCard({ workflow, summary }: WorkflowCardProps) {
  const sparkline = generateSparkline(workflow.id, 10)

  return (
    <div
      className="card group cursor-pointer transition-all duration-150"
      style={{ borderTop: `3px solid ${workflow.color}` }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(10,22,40,0.12)'
        e.currentTarget.style.borderColor = '#D4AF37'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(10,22,40,0.06)'
        e.currentTarget.style.borderColor = '#E2E8F0'
      }}
    >
      <Link href={`/workflows/${workflow.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            {workflow.name}
          </h3>
          <VerdictBadge verdict={summary.verdict} size="sm" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#FBF5DC', color: '#A8891A' }}>
            {workflow.framework}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#E8EEF5', color: '#1E3A5F' }}>
            {workflow.model}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {workflow.agents.map(agent => (
            <span
              key={agent}
              className="px-2 py-0.5 rounded text-[10px] font-medium"
              style={{ background: '#F7F9FC', color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              {agent}
            </span>
          ))}
        </div>

        <div className="text-xs mb-3" style={{ color: '#64748B' }}>
          {summary.total_runs} runs · {Math.round(summary.success_rate * 100)}% success · ${summary.cost_per_success.toFixed(4)}/outcome
        </div>

        <div style={{ width: '100%', height: 40 }} className="mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line type="monotone" dataKey="value" stroke={workflow.color} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#D4AF37' }}>
          View Details <ArrowRight size={14} />
        </div>
      </Link>
    </div>
  )
}
