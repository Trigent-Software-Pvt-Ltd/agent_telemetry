'use client'

import type { TransformationStage } from '@/types/telemetry'

interface StageTimelineProps {
  stages: TransformationStage[]
  selectedId: string
  onSelect: (id: string) => void
}

export function StageTimeline({ stages, selectedId, onSelect }: StageTimelineProps) {
  return (
    <div className="card animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-5">
        Maturity Progression
      </h3>
      <div className="flex items-stretch gap-0">
        {stages.map((stage, i) => {
          const isSelected = stage.id === selectedId
          const isCurrent = i === 0
          const isLast = i === stages.length - 1

          return (
            <div key={stage.id} className="flex items-stretch flex-1 min-w-0">
              <button
                type="button"
                onClick={() => onSelect(stage.id)}
                className="flex-1 p-4 rounded-xl text-left transition-all cursor-pointer"
                style={{
                  border: isSelected
                    ? '2px solid var(--accent-blue)'
                    : isCurrent
                      ? '2px solid var(--status-green)'
                      : '1px solid var(--border)',
                  backgroundColor: isSelected
                    ? 'var(--accent-blue-bg)'
                    : isCurrent
                      ? 'var(--status-green-bg)'
                      : '#FFFFFF',
                }}
              >
                {/* Stage indicator */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: isCurrent
                        ? 'var(--status-green)'
                        : isLast
                          ? 'var(--accent-blue)'
                          : 'var(--status-amber)',
                      opacity: isCurrent ? 1 : 0.6,
                    }}
                  />
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-text-secondary">
                    Stage {i + 1} of {stages.length}
                  </span>
                </div>

                {/* Name */}
                <p
                  className="text-sm font-bold leading-tight mb-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stage.name}
                </p>

                {/* Metrics */}
                <div className="space-y-1.5">
                  {stage.sigmaTh > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">Sigma threshold</span>
                      <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                        {stage.sigmaTh.toFixed(1)}&sigma;
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Agent coverage</span>
                    <span className="font-bold tabular-nums" style={{ color: 'var(--status-green)' }}>
                      {Math.round(stage.agentCoverage * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Weekly ROI</span>
                    <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      ${stage.weeklyNetRoi.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div
                  className="mt-3 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {stage.estimatedTimeline}
                </div>
              </button>

              {/* Arrow connector */}
              {!isLast && (
                <div className="flex items-center px-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L13 6M19 12L13 18"
                      stroke="var(--border)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
