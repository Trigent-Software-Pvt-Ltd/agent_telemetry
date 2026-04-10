import {
  getProcessById,
  getAgentsForProcess,
  getTasksForProcess,
  getRoiForProcess,
} from '@/lib/data-source'
import { notFound } from 'next/navigation'
import { SymmetryDashboard } from './SymmetryDashboard'

export default async function ProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const process = await getProcessById(id)
  if (!process) return notFound()

  const agents = await getAgentsForProcess(id)
  const tasks = await getTasksForProcess(id)
  const roi = await getRoiForProcess(id)
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
