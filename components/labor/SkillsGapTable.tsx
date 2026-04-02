import type { SkillGap } from '@/types/telemetry'
import { AlertTriangle, ArrowUp, ArrowRight, Minus } from 'lucide-react'

interface SkillsGapTableProps {
  skills: SkillGap[]
}

function LevelBar({ level, max = 5 }: { level: number; max?: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-sm"
          style={{
            background: i < level ? 'var(--accent-blue)' : 'var(--border)',
            opacity: i < level ? 1 : 0.4,
          }}
        />
      ))}
      <span className="ml-1 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {level}/{max}
      </span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: 'High' | 'Medium' | 'Low' }) {
  const config = {
    High:   { bg: 'var(--status-red-bg)', color: 'var(--status-red)', icon: ArrowUp },
    Medium: { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)', icon: ArrowRight },
    Low:    { bg: 'var(--status-green-bg)', color: 'var(--status-green)', icon: Minus },
  }
  const { bg, color, icon: Icon } = config[priority]

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color }}
    >
      <Icon size={11} />
      {priority}
    </span>
  )
}

export function SkillsGapTable({ skills }: SkillsGapTableProps) {
  return (
    <div className="card animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} style={{ color: 'var(--status-amber)' }} />
        <h2 className="text-base font-semibold">Skills Gap Analysis</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Skill</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Current</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Required</th>
              <th className="text-center py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Gap</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Priority</th>
              <th className="text-left py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Suggested Training</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(skill => (
              <tr key={skill.skill} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {skill.skill}
                </td>
                <td className="py-3 pr-4">
                  <LevelBar level={skill.currentLevel} />
                </td>
                <td className="py-3 pr-4">
                  <LevelBar level={skill.requiredLevel} />
                </td>
                <td className="py-3 pr-4 text-center">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                    style={{
                      background: skill.gap >= 2 ? 'var(--status-red-bg)' : 'var(--status-amber-bg)',
                      color: skill.gap >= 2 ? 'var(--status-red)' : 'var(--status-amber)',
                    }}
                  >
                    -{skill.gap}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <PriorityBadge priority={skill.priority} />
                </td>
                <td className="py-3">
                  <div>
                    <span style={{ color: 'var(--accent-blue)' }}>{skill.suggestedTraining}</span>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {skill.suggestedUrl}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
