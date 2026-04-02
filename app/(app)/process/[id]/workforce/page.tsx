'use client'

import { useState, use } from 'react'
import type { Scenario } from '@/types/telemetry'
import { getWorkforceProjection, getWorkforceProcess, getTeamMembers } from '@/lib/mock-data'
import { ScenarioToggle } from '@/components/labor/ScenarioToggle'
import { WorkforceSummary } from '@/components/labor/WorkforceSummary'
import { WorkforcePlanCharts } from '@/components/labor/WorkforcePlanCharts'
import { TeamImpactCards } from '@/components/labor/TeamImpactCards'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default function WorkforcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [scenario, setScenario] = useState<Scenario>('moderate')

  const process = getWorkforceProcess(id)
  const projection = getWorkforceProjection(id, scenario)
  const last = projection.months[projection.months.length - 1]
  const redeployable = process.currentHeadcount - last.headcount

  const paceLabel = scenario === 'aggressive' ? 'aggressive' : scenario === 'moderate' ? 'moderate' : 'conservative'
  const callout = `At ${paceLabel} pace, ${redeployable} of ${process.currentHeadcount} analysts can be redeployed to higher-value roles by Q4 2026`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/process/${id}`}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--vip-navy-100, #E8EDF5)' }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--vip-navy)' }} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Users size={20} style={{ color: 'var(--vip-gold)' }} />
              <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
                Workforce Planning
              </h1>
            </div>
            <p className="text-sm mt-0.5" style={{ color: 'var(--vip-muted)' }}>
              {process.name}
            </p>
          </div>
        </div>
        <ScenarioToggle active={scenario} onChange={setScenario} />
      </div>

      {/* Summary cards */}
      <WorkforceSummary projection={projection} currentHeadcount={process.currentHeadcount} />

      {/* Callout */}
      <div
        className="card flex items-center gap-3"
        style={{ background: 'var(--vip-gold-subtle, #FBF5DC)', borderColor: 'var(--vip-gold)' }}
      >
        <Users size={18} style={{ color: 'var(--vip-gold-hover, #A8891A)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--vip-navy)' }}>
          {callout}
        </p>
      </div>

      {/* Charts */}
      <WorkforcePlanCharts projection={projection} />

      {/* Team Impact */}
      <TeamImpactCards members={getTeamMembers()} />
    </div>
  )
}
