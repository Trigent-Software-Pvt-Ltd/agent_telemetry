'use client'

import { AgentColumn } from '@/components/symmetry/AgentColumn'
import { EquationCenter } from '@/components/symmetry/EquationCenter'
import { HumanColumn } from '@/components/symmetry/HumanColumn'
import { RoiWaterfall } from '@/components/symmetry/RoiWaterfall'
import type { Process, Agent, OnetTask, RoiSnapshot } from '@/types/telemetry'

interface SymmetryDashboardProps {
  process: Process
  agents: Agent[]
  agentTasks: OnetTask[]
  humanTasks: OnetTask[]
  roi: RoiSnapshot
}

export function SymmetryDashboard({
  process,
  agents,
  agentTasks,
  humanTasks,
  roi,
}: SymmetryDashboardProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {process.name}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-mono font-medium"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            O*NET {process.onetCode}
          </span>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {process.headcount} people &middot; ${process.avgHourlyWage}/hr &middot; {process.weeklyHours}hrs/wk
          </span>
        </div>
      </div>

      {/* Three columns: Agent | Equation | Human */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr_3fr] gap-5 items-start">
        <AgentColumn
          agents={agents}
          agentTasks={agentTasks}
          roi={roi}
          agentCoverage={process.agentCoverage}
          processId={process.id}
        />

        <EquationCenter
          agents={agents}
          roi={roi}
          agentCoverage={process.agentCoverage}
          humanCoverage={process.humanCoverage}
          processId={process.id}
        />

        <HumanColumn
          process={process}
          humanTasks={humanTasks}
          roi={roi}
        />
      </div>

      {/* ROI Waterfall */}
      <RoiWaterfall roi={roi} />
    </div>
  )
}
