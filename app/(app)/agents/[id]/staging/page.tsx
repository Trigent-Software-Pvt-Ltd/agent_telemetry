'use client'

import { use } from 'react'
import Link from 'next/link'
import { getAgentById, getStagingCandidate } from '@/lib/mock-data'
import { StagingView } from '@/components/telemetry/StagingView'
import { ArrowLeft } from 'lucide-react'

export default function AgentStagingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const agent = getAgentById(id)
  const candidate = getStagingCandidate(id)

  if (!agent || !candidate) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg" style={{ color: 'var(--vip-muted)' }}>
          {!agent ? 'Agent not found' : 'No staging candidate available'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/agents/${id}`}
        className="flex items-center gap-1.5 text-sm font-medium w-fit"
        style={{ color: 'var(--vip-muted)' }}
      >
        <ArrowLeft size={14} />
        Back to {agent.name}
      </Link>

      <StagingView candidate={candidate} workflowName={agent.name} />
    </div>
  )
}
