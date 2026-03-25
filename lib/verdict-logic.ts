import { Verdict } from '@/types/telemetry'

export const VERDICT_CONFIG = {
  GREEN: { bg: '#ECFDF5', border: '#059669', badgeBg: '#059669', badgeText: '#FFFFFF', icon: '✓', label: 'Hypothesis Proven' },
  AMBER: { bg: '#FFFBEB', border: '#D97706', badgeBg: '#D97706', badgeText: '#FFFFFF', icon: '~', label: 'Needs Attention' },
  RED:   { bg: '#FFF5F5', border: '#DC2626', badgeBg: '#DC2626', badgeText: '#FFFFFF', icon: '✗', label: 'Below Target' },
} as const

export function getVerdictConfig(verdict: Verdict) {
  return VERDICT_CONFIG[verdict]
}

export function generateRecommendations(workflowId: string, verdict: Verdict, slaHitRate: number, successRate: number): string[] {
  const recs: string[] = []
  if (verdict === 'GREEN') {
    recs.push('Workflow is performing well. Consider increasing SLA target to challenge the team further.')
    recs.push('ROI is positive — explore scaling this workflow to handle more volume.')
    recs.push('Monitor consistency score weekly to catch degradation early.')
  } else if (verdict === 'AMBER') {
    recs.push(`SLA hit rate is ${Math.round(slaHitRate * 100)}% — identify which agent is causing the most variance.`)
    recs.push('Review the slowest 10% of runs for common patterns (timeouts, retries).')
    recs.push('Consider adding caching or fallback logic to reduce tail latency.')
  } else {
    recs.push(`Success rate is only ${Math.round(successRate * 100)}% — immediate investigation needed.`)
    recs.push('Check upstream dependencies (APIs, databases) for reliability issues.')
    recs.push('Consider reducing workflow complexity or splitting into smaller sub-workflows.')
  }
  return recs
}
