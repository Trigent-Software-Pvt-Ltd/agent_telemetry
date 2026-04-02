import type { TeamMemberTraining } from '@/types/telemetry'
import { GraduationCap, CheckCircle2, Clock, CircleDot } from 'lucide-react'

interface TrainingProgressProps {
  members: TeamMemberTraining[]
}

function ProgressBar({ value, height = 8 }: { value: number; height?: number }) {
  const color = value >= 75 ? 'var(--status-green)' : value >= 40 ? 'var(--status-amber)' : 'var(--accent-blue)'
  return (
    <div className="w-full rounded-full" style={{ height, background: 'var(--border)' }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ width: `${value}%`, height, background: color }}
      />
    </div>
  )
}

function StatusIcon({ status }: { status: 'completed' | 'in-progress' | 'not-started' }) {
  if (status === 'completed') return <CheckCircle2 size={14} style={{ color: 'var(--status-green)' }} />
  if (status === 'in-progress') return <Clock size={14} style={{ color: 'var(--status-amber)' }} />
  return <CircleDot size={14} style={{ color: 'var(--text-muted)' }} />
}

export function TrainingProgress({ members }: TrainingProgressProps) {
  const avgProgress = members.length > 0
    ? Math.round(members.reduce((s, m) => s + m.overallProgress, 0) / members.length)
    : 0

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} style={{ color: 'var(--accent-blue)' }} />
          <h2 className="text-base font-semibold">Training Progress</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Team training progress:
          </span>
          <span
            className="text-sm font-bold tabular-nums"
            style={{ color: avgProgress >= 50 ? 'var(--status-green)' : 'var(--status-amber)' }}
          >
            {avgProgress}% complete
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6">
        <ProgressBar value={avgProgress} height={10} />
      </div>

      {/* Team member cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {members.map(member => (
          <div
            key={member.name}
            className="rounded-xl p-4"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--accent-blue)', color: '#FFFFFF' }}
              >
                {member.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {member.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {member.role}
                </div>
              </div>
            </div>

            {/* Overall progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Overall</span>
                <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {member.overallProgress}%
                </span>
              </div>
              <ProgressBar value={member.overallProgress} />
            </div>

            {/* Individual trainings */}
            <div className="flex flex-col gap-2 mt-3" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {member.trainings.map(t => (
                <div key={t.trainingName} className="flex items-center gap-2">
                  <StatusIcon status={t.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                      {t.trainingName}
                    </div>
                    <div className="w-full mt-1">
                      <ProgressBar value={t.progress} height={4} />
                    </div>
                  </div>
                  <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {t.progress}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
