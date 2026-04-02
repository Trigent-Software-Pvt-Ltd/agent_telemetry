import type { SkillGap } from '@/types/telemetry'
import { Lightbulb, ArrowRight } from 'lucide-react'

interface TrainingRecommendationsProps {
  skills: SkillGap[]
  processName: string
}

export function TrainingRecommendations({ skills, processName }: TrainingRecommendationsProps) {
  // Generate recommendations from skills data
  const highPrioritySkills = skills.filter(s => s.priority === 'High')
  const topSkill = skills.reduce((a, b) => a.affectedTaskWeight > b.affectedTaskWeight ? a : b, skills[0])
  const promptSkill = skills.find(s => s.skill === 'Prompt engineering')

  const recommendations = [
    {
      id: 'rec-1',
      title: `Focus on ${topSkill?.skill} skills`,
      description: `${Math.round((topSkill?.affectedTaskWeight ?? 0) * 100)}% of collaborative task time requires this competency. Closing this gap will have the highest impact on ${processName} team effectiveness.`,
      action: topSkill?.suggestedTraining ?? 'Enroll team in relevant training',
    },
    ...(promptSkill ? [{
      id: 'rec-2',
      title: 'Consider Prompt Engineering certification for team leads',
      description: `As AI agents handle ${Math.round((topSkill?.affectedTaskWeight ?? 0) * 100)}% of work, team leads need prompt engineering skills to effectively tune and manage agent behavior.`,
      action: promptSkill.suggestedTraining,
    }] : []),
    {
      id: 'rec-3',
      title: `${highPrioritySkills.length} high-priority skill gaps identified`,
      description: `Address ${highPrioritySkills.map(s => s.skill).join(', ')} gaps to ensure the team can effectively oversee AI agent output and handle escalations.`,
      action: 'Create training plan for Q2 2026',
    },
  ]

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} style={{ color: 'var(--status-amber)' }} />
        <h2 className="text-base font-semibold">Recommendations</h2>
      </div>

      <div className="flex flex-col gap-4">
        {recommendations.map(rec => (
          <div
            key={rec.id}
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {rec.title}
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              {rec.description}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--accent-blue)' }}>
              <ArrowRight size={12} />
              {rec.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
