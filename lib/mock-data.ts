import { Workflow, Run, WorkflowSummary } from '@/types/telemetry'

export const WORKFLOWS: Workflow[] = [
  {
    id: "odds-analysis-agent",
    name: "Odds Analysis Agent",
    description: "Fetches live odds, compares lines, generates betting recommendation",
    agents: ["OddsScraperAgent", "LineComparisonAgent", "RecommendationWriterAgent"],
    framework: "CrewAI",
    model: "gpt-4o",
    sla_ms: 3500,
    value_per_success: 45.00,
    color: "#0891B2",
  },
  {
    id: "player-engagement-agent",
    name: "Player Engagement Agent",
    description: "Analyses player history, generates personalised offer copy",
    agents: ["PlayerProfilerAgent", "OfferGeneratorAgent", "CopyWriterAgent"],
    framework: "CrewAI",
    model: "claude-3-5-sonnet",
    sla_ms: 2800,
    value_per_success: 32.00,
    color: "#D4AF37",
  },
  {
    id: "content-moderation-agent",
    name: "Content Moderation Agent",
    description: "Screens UGC against compliance rules across 3 jurisdictions",
    agents: ["ContentExtractorAgent", "ComplianceCheckerAgent", "FlagDecisionAgent"],
    framework: "CrewAI",
    model: "gpt-4o-mini",
    sla_ms: 1500,
    value_per_success: 12.00,
    color: "#7C3AED",
  },
  {
    id: "vip-support-agent",
    name: "VIP Customer Support Agent",
    description: "Intent classification → knowledge retrieval → response drafting",
    agents: ["IntentClassifierAgent", "KnowledgeRetrieverAgent", "ResponseDraftAgent"],
    framework: "CrewAI",
    model: "claude-3-5-sonnet",
    sla_ms: 4000,
    value_per_success: 68.00,
    color: "#059669",
  },
]

export function generateRuns(workflowId: string, count = 50): Run[] {
  const workflow = WORKFLOWS.find(w => w.id === workflowId)!
  const seed = workflowId.length * 137

  return Array.from({ length: count }, (_, i) => {
    const s = (seed + i * 31337) % 1000
    const tier = s < 720 ? 'fast' : s < 870 ? 'slow' : 'failed'

    const duration_ms =
      tier === 'fast'   ? 800 + (s % 800)
      : tier === 'slow' ? 3200 + (s % 2000)
      : 1200 + (s % 1400)

    const tokens = tier === 'failed' ? 400 + (s % 300) : 1200 + (s % 2000)
    const rateMap: Record<string, number> = {
      'gpt-4o': 0.000015, 'gpt-4o-mini': 0.000003, 'claude-3-5-sonnet': 0.000012
    }
    const cost = tokens * (rateMap[workflow.model] ?? 0.000010)
    const ts = new Date(Date.now() - i * 2.4 * 3600 * 1000).toISOString()

    const splits = [[0.25, 0.45, 0.30], [0.20, 0.55, 0.25], [0.30, 0.40, 0.30]]
    const split = splits[i % 3]

    return {
      run_id:      `${workflowId.slice(0,4).toUpperCase()}-${String(i+1).padStart(4,'0')}`,
      workflow_id: workflowId,
      timestamp:   ts,
      duration_ms,
      total_cost:  parseFloat(cost.toFixed(6)),
      outcome:     tier !== 'failed',
      model:       workflow.model,
      token_count: tokens,
      tool_calls:  tier === 'failed' ? 1 : 3 + (s % 4),
      framework:   workflow.framework,
      spans: tier === 'failed'
        ? [
            { name: workflow.agents[0], duration_ms: Math.round(duration_ms * 0.6), status: 'ok' as const, cost: parseFloat((cost*0.4).toFixed(6)), tool_calls: 2 },
            { name: workflow.agents[1], duration_ms: Math.round(duration_ms * 0.4), status: 'error' as const, cost: parseFloat((cost*0.6).toFixed(6)), tool_calls: 0, error: 'Upstream timeout: odds feed unavailable after 3 retries' },
          ]
        : workflow.agents.map((agent, ai) => ({
            name:        agent,
            duration_ms: Math.round(duration_ms * split[ai]),
            status:      'ok' as const,
            cost:        parseFloat((cost * split[ai]).toFixed(6)),
            tool_calls:  1 + (s % 2),
          })),
    }
  })
}

export function computeSummary(workflowId: string): WorkflowSummary {
  const runs = generateRuns(workflowId)
  const workflow = WORKFLOWS.find(w => w.id === workflowId)!
  const successful = runs.filter(r => r.outcome)
  const durations  = runs.map(r => r.duration_ms).sort((a,b)=>a-b)
  const costs      = runs.map(r => r.total_cost)
  const totalCost  = costs.reduce((a,b)=>a+b,0)
  const slaHits    = runs.filter(r => r.duration_ms <= workflow.sla_ms).length

  const mean  = durations.reduce((a,b)=>a+b,0) / durations.length
  const std   = Math.sqrt(durations.reduce((s,d)=>s+(d-mean)**2,0)/durations.length)
  const cv    = std / mean
  const consistency = Math.max(0, Math.min(100, Math.round(100*(1-cv))))

  const successRate = successful.length / runs.length
  const slaHitRate  = slaHits / runs.length
  const totalValue  = successful.length * workflow.value_per_success
  const roiPositive = totalValue > totalCost

  let verdict: 'GREEN' | 'AMBER' | 'RED'
  if (slaHitRate >= 0.88 && successRate >= 0.82 && roiPositive) verdict = 'GREEN'
  else if (slaHitRate >= 0.70 || successRate >= 0.65) verdict = 'AMBER'
  else verdict = 'RED'

  const verdictText = {
    GREEN: `This workflow is performing consistently and delivering positive ROI. SLA hit rate is ${Math.round(slaHitRate*100)}% with a ${Math.round(successRate*100)}% success rate. Hypothesis proven.`,
    AMBER: `This workflow is mostly on track but showing inconsistency. SLA hit rate is ${Math.round(slaHitRate*100)}% — target is 88%. Tuning needed before the hypothesis is proven.`,
    RED:   `This workflow is not meeting performance targets. SLA hit rate is only ${Math.round(slaHitRate*100)}% and success rate is ${Math.round(successRate*100)}%. Immediate review recommended.`,
  }[verdict]

  const agentCosts = workflow.agents.map((agent, ai) => {
    const avgCost = runs
      .filter(r => r.outcome)
      .reduce((s,r) => s + (r.spans[ai]?.cost ?? 0), 0) / (successful.length || 1)
    return { agent, avgCost: parseFloat(avgCost.toFixed(6)) }
  })

  return {
    workflow_id:       workflowId,
    total_runs:        runs.length,
    successful_runs:   successful.length,
    success_rate:      successRate,
    avg_duration_ms:   Math.round(mean),
    p50_duration_ms:   durations[Math.floor(durations.length*0.50)],
    p90_duration_ms:   durations[Math.floor(durations.length*0.90)],
    p95_duration_ms:   durations[Math.floor(durations.length*0.95)],
    avg_cost:          totalCost / runs.length,
    total_cost:        totalCost,
    cost_per_success:  totalCost / (successful.length||1),
    sla_hit_rate:      slaHitRate,
    consistency_score: consistency,
    roi_positive:      roiPositive,
    total_value:       totalValue,
    verdict,
    verdict_text:      verdictText,
    hypothesis_proven: verdict === 'GREEN',
    agent_costs:       agentCosts,
    sla_ms:            workflow.sla_ms,
  }
}

export function generateSparkline(workflowId: string, count = 7): { value: number }[] {
  const runs = generateRuns(workflowId, count)
  return runs.map(r => ({ value: r.duration_ms }))
}
