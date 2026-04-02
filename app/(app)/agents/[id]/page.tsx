import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAgentById, getRunsForAgent, getProcessById, getAgentRoi, ORGANISATION } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const agent = getAgentById(id)
  return { title: agent ? agent.name : 'Agent' }
}
import AgentHeader from '@/components/telemetry/AgentHeader'
import MetricsBar from '@/components/telemetry/MetricsBar'
import AgentRoiCard from '@/components/telemetry/AgentRoiCard'
import SigmaContext from '@/components/telemetry/SigmaContext'
import RunHistory from '@/components/telemetry/RunHistory'
import DefectAnalysis from '@/components/telemetry/DefectAnalysis'
import CostOfInaction from '@/components/telemetry/CostOfInaction'

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agent = getAgentById(id)
  if (!agent) notFound()

  const process = getProcessById(agent.processId)
  if (!process) notFound()

  const runs = getRunsForAgent(id)

  // Compute derived stats
  const durations = runs.map((r) => r.durationMs).sort((a, b) => a - b)
  const mean = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
  const std = Math.sqrt(durations.reduce((s, d) => s + (d - mean) ** 2, 0) / (durations.length || 1))
  const cv = mean > 0 ? std / mean : 0
  const consistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))))

  const slaHits = runs.filter((r) => r.durationMs <= agent.p95LatencyMs).length
  const slaHitRate = runs.length > 0 ? slaHits / runs.length : 0

  const successfulRuns = runs.filter((r) => r.outcome)
  const totalCost = runs.reduce((s, r) => s + r.totalCost, 0)
  const costPerOutcome = successfulRuns.length > 0
    ? `$${(totalCost / successfulRuns.length).toFixed(4)}`
    : 'N/A'

  const agentRoi = getAgentRoi(id)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Agent Header */}
      <AgentHeader
        agent={agent}
        consistency={consistency}
        slaHitRate={slaHitRate}
        costPerOutcome={costPerOutcome}
      />

      {/* Metrics Bar */}
      <MetricsBar
        totalRuns={agent.totalRuns}
        successRate={agent.successRate}
        avgCost={agent.avgCostPerRun}
        p95Latency={agent.p95LatencyMs}
      />

      {/* Cost of Inaction — moved above ROI for executive visibility */}
      <CostOfInaction
        agent={agent}
        sigmaTarget={ORGANISATION.sigmaTarget}
        defaultOpen={agent.sigmaScore < ORGANISATION.sigmaTarget && agent.sigmaTrend === 'down'}
      />

      {/* Agent ROI Breakdown */}
      {agentRoi && <AgentRoiCard roi={agentRoi} />}

      {/* Main content: Run History + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run History (takes 2 cols) */}
        <div className="lg:col-span-2">
          <RunHistory runs={runs} />
        </div>

        {/* Sidebar: Sigma Context + Defect Analysis */}
        <div className="space-y-6">
          <SigmaContext agent={agent} process={process} />
          <DefectAnalysis agent={agent} />
        </div>
      </div>
    </div>
  )
}
