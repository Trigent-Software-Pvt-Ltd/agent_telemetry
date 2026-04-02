import type { TransformationStage } from '@/types/telemetry'

interface StageDetailProps {
  stage: TransformationStage
  previousStage: TransformationStage | null
}

export function StageDetail({ stage, previousStage }: StageDetailProps) {
  const sections = [
    { label: 'Agent', pct: stage.agentCoverage, color: 'var(--status-green)' },
    { label: 'Collaborative', pct: stage.collaborativeCoverage, color: 'var(--status-amber)' },
    { label: 'Human', pct: stage.humanCoverage, color: 'var(--text-muted)' },
  ]

  const roiChange = previousStage
    ? ((stage.weeklyNetRoi - previousStage.weeklyNetRoi) / previousStage.weeklyNetRoi) * 100
    : 0

  return (
    <div className="card animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
        Stage Detail
      </h3>

      <p className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        {stage.name}
      </p>

      {/* Coverage bar */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-2">
          Coverage at this stage
        </p>
        <div className="flex w-full h-8 rounded-lg overflow-hidden">
          {sections.map((s) => (
            <div
              key={s.label}
              className="flex items-center justify-center text-[11px] font-semibold"
              style={{
                width: `${Math.round(s.pct * 100)}%`,
                backgroundColor: s.color,
                color: '#FFFFFF',
              }}
            >
              {Math.round(s.pct * 100)}%
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          {sections.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
              {s.label} {Math.round(s.pct * 100)}%
            </div>
          ))}
        </div>
      </div>

      {/* Tasks that migrate */}
      {stage.tasksToMigrate.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-2">
            Tasks that migrate
          </p>
          <div className="space-y-2">
            {stage.tasksToMigrate.map((task) => (
              <div
                key={task}
                className="flex items-center gap-2 p-2.5 rounded-lg text-sm"
                style={{ backgroundColor: 'var(--status-green-bg)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="var(--status-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: 'var(--text-primary)' }}>{task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI impact */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-2">
          ROI Impact
        </p>
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-blue-bg)' }}>
          {previousStage ? (
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Net ROI increases from{' '}
              <span className="font-bold tabular-nums">${previousStage.weeklyNetRoi.toLocaleString()}</span>
              {' '}to{' '}
              <span className="font-bold tabular-nums">${stage.weeklyNetRoi.toLocaleString()}/week</span>
              {' '}
              <span className="font-bold" style={{ color: 'var(--status-green)' }}>
                (+{Math.round(roiChange)}%)
              </span>
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Current weekly net ROI:{' '}
              <span className="font-bold tabular-nums">${stage.weeklyNetRoi.toLocaleString()}/week</span>
            </p>
          )}
        </div>
      </div>

      {/* Sigma requirement and timeline */}
      <div className="grid grid-cols-2 gap-4">
        {stage.sigmaTh > 0 && (
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
            <p className="text-[10px] uppercase tracking-wide text-text-secondary mb-0.5">
              Sigma Requirement
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              All agents at {stage.sigmaTh.toFixed(1)}&sigma; minimum
            </p>
          </div>
        )}
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
          <p className="text-[10px] uppercase tracking-wide text-text-secondary mb-0.5">
            Estimated Timeline
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {stage.estimatedTimeline}
          </p>
        </div>
      </div>
    </div>
  )
}
