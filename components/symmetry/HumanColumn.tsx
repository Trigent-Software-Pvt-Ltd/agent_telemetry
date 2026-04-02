'use client'

import type { OnetTask, RoiSnapshot, Process } from '@/types/telemetry'

interface HumanColumnProps {
  process: Process
  humanTasks: OnetTask[]
  roi: RoiSnapshot
}

const NEW_SKILLS = [
  'AI output review',
  'Exception escalation',
  'Prompt interpretation',
  'Audit trail documentation',
]

export function HumanColumn({ process, humanTasks, roi }: HumanColumnProps) {
  const humanPct = Math.round(process.humanCoverage * 100)

  // Hours freed = agent coverage * weekly hours
  const hoursFreed = Math.round(process.agentCoverage * process.weeklyHours)

  // Oversight hours = oversight cost / hourly wage
  const oversightHours = Math.round(roi.oversightCostWeekly / process.avgHourlyWage)

  // Net hours saved
  const netHoursSaved = hoursFreed - oversightHours

  return (
    <div className="card flex flex-col gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--text-secondary)' }}
          />
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            What your team still owns
          </h3>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Coverage */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            Coverage
          </div>
          <div className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {humanPct}%
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            of role tasks
          </div>
        </div>

        {/* Hours freed */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
            Hours freed
          </div>
          <div className="text-3xl font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
            {hoursFreed}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            hrs/wk/person
          </div>
        </div>
      </div>

      {/* Hours breakdown */}
      <div
        className="rounded-lg px-4 py-3 flex flex-col gap-2"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Oversight added
          </span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--status-amber)' }}>
            +{oversightHours}hrs/wk
          </span>
        </div>
        <div
          className="border-t pt-2 flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Net hours saved
          </span>
          <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
            {netHoursSaved}hrs/wk/person
          </span>
        </div>
      </div>

      {/* Retained tasks */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          Top retained tasks
        </div>
        <div className="flex flex-col gap-2">
          {humanTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg px-3 py-2.5 flex items-start gap-3"
              style={{ background: 'var(--surface)' }}
            >
              <div
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: 'var(--text-muted)' }}
              />
              <div className="min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {task.task}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {Math.round(task.timeWeight * 100)}% of time
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New skills needed */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
          New skills needed
        </div>
        <div className="flex flex-wrap gap-2">
          {NEW_SKILLS.map((skill) => (
            <span
              key={skill}
              className="inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: 'var(--accent-blue-bg)',
                color: 'var(--accent-blue)',
                border: '1px solid rgba(55, 138, 221, 0.2)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
