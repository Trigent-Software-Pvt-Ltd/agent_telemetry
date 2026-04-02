import { notFound } from 'next/navigation'
import { getProcessById, getSkillsGap, getTrainingProgress } from '@/lib/mock-data'
import { SkillsGapTable } from '@/components/labor/SkillsGapTable'
import { TrainingProgress } from '@/components/labor/TrainingProgress'
import { TrainingRecommendations } from '@/components/labor/TrainingRecommendations'

export default async function TrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const process = getProcessById(id)
  if (!process) notFound()

  const skills = getSkillsGap(id)
  const members = getTrainingProgress(id)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}>
          Skills Gap &amp; Training Plan
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {process.name} &mdash; {process.headcount} headcount
        </p>
      </div>

      {/* Skills Gap Analysis */}
      <SkillsGapTable skills={skills} />

      {/* Training Progress */}
      <TrainingProgress members={members} />

      {/* Recommendations */}
      {skills.length > 0 && (
        <TrainingRecommendations skills={skills} processName={process.name} />
      )}
    </div>
  )
}
