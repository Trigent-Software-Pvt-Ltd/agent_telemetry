import { getProcessById, getCoverageMap, getAgentsForProcess, getTasksForProcess, getTaskPerformance } from '@/lib/data-source'
import { notFound } from 'next/navigation'
import { TaskOwnershipPage } from '@/components/coverage/TaskOwnershipPage'

export default async function CoverageMapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const process = await getProcessById(id)
  if (!process) return notFound()

  const entries = await getCoverageMap(id)
  const agents = await getAgentsForProcess(id)
  const tasks = await getTasksForProcess(id)
  const taskPerformance = await getTaskPerformance()

  return (
    <TaskOwnershipPage
      entries={entries}
      agents={agents}
      tasks={tasks}
      process={process}
      taskPerformance={taskPerformance}
    />
  )
}
