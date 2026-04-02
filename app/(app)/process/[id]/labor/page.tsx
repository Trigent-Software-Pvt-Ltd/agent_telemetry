import { notFound } from 'next/navigation'
import { getProcessById, getTasksForProcess } from '@/lib/mock-data'
import CoverageBar from '@/components/labor/CoverageBar'
import TaskBoard from '@/components/labor/TaskBoard'
import SkillsPanel from '@/components/labor/SkillsPanel'

export default async function LaborGraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const process = getProcessById(id)
  if (!process) notFound()

  const tasks = getTasksForProcess(id)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-bold text-text-primary">{process.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-text-secondary">
          <span>O*NET {process.onetCode}</span>
          <span className="text-text-muted">&middot;</span>
          <span>{process.headcount} headcount</span>
          <span className="text-text-muted">&middot;</span>
          <span>{process.weeklyHours} hrs/week</span>
          <span className="text-text-muted">&middot;</span>
          <span>${process.avgHourlyWage}/hr</span>
        </div>
      </div>

      {/* Coverage Bar */}
      <CoverageBar
        agentPct={process.agentCoverage}
        collaborativePct={process.collaborativeCoverage}
        humanPct={process.humanCoverage}
      />

      {/* Task Board */}
      <TaskBoard tasks={tasks} />

      {/* Skills Panel */}
      <SkillsPanel />
    </div>
  )
}
