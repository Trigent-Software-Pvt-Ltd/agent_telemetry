export type Verdict = 'GREEN' | 'AMBER' | 'RED'

export interface Workflow {
  id: string
  name: string
  description: string
  agents: string[]
  framework: string
  model: string
  sla_ms: number
  value_per_success: number
  color: string
}

export interface Span {
  name: string
  duration_ms: number
  status: 'ok' | 'error'
  cost: number
  tool_calls: number
  error?: string
}

export interface Run {
  run_id: string
  workflow_id: string
  timestamp: string
  duration_ms: number
  total_cost: number
  outcome: boolean
  model: string
  token_count: number
  tool_calls: number
  framework: string
  spans: Span[]
}

export interface WorkflowSummary {
  workflow_id: string
  total_runs: number
  successful_runs: number
  success_rate: number
  avg_duration_ms: number
  p50_duration_ms: number
  p90_duration_ms: number
  p95_duration_ms: number
  avg_cost: number
  total_cost: number
  cost_per_success: number
  sla_hit_rate: number
  consistency_score: number
  roi_positive: boolean
  total_value: number
  verdict: Verdict
  verdict_text: string
  hypothesis_proven: boolean
  agent_costs: { agent: string; avgCost: number }[]
  sla_ms: number
}

export interface SparklinePoint {
  value: number
}
