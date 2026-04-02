import {
  getProcessById,
  getAgentsForProcess,
  getTasksForProcess,
  getRoiForProcess,
} from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import { SymmetryDashboard } from './SymmetryDashboard'

export default async function ProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const process = getProcessById(id)
  if (!process) return notFound()

  const agents = getAgentsForProcess(id)
  const tasks = getTasksForProcess(id)
  const roi = getRoiForProcess(id)
  if (!roi) return notFound()

  const agentTasks = tasks.filter((t) => t.ownership === 'agent')
  const humanTasks = tasks.filter((t) => t.ownership === 'human')

  return (
    <SymmetryDashboard
      process={process}
      agents={agents}
      agentTasks={agentTasks}
      humanTasks={humanTasks}
      roi={roi}
    />
  )
}
