import type { Verdict } from '@/types/telemetry'

export const VERDICT_CONFIG = {
  GREEN: {
    bg: '#ECFDF5',
    border: '#1D9E75',
    badgeBg: '#1D9E75',
    badgeText: '#FFFFFF',
    icon: '✓',
    label: 'Hypothesis Proven',
  },
  AMBER: {
    bg: '#FFF8EB',
    border: '#BA7517',
    badgeBg: '#BA7517',
    badgeText: '#FFFFFF',
    icon: '~',
    label: 'Needs Attention',
  },
  RED: {
    bg: '#FEF2F2',
    border: '#E24B4A',
    badgeBg: '#E24B4A',
    badgeText: '#FFFFFF',
    icon: '✗',
    label: 'Below Target',
  },
} as const

/** Accent blue for highlights, charts, active states */
export const ACCENT_BLUE = '#378ADD'

/** Card border colour */
export const CARD_BORDER = '#E8E6E0'

export function getVerdictConfig(verdict: Verdict) {
  return VERDICT_CONFIG[verdict]
}

export function generateRecommendations(
  _workflowId: string,
  verdict: Verdict,
  slaHitRate: number,
  successRate: number,
): string[] {
  const recs: string[] = []
  if (verdict === 'GREEN') {
    recs.push(
      'Workflow is performing well. Consider increasing SLA target to challenge the team further.',
    )
    recs.push(
      'ROI is positive — explore scaling this workflow to handle more volume.',
    )
    recs.push(
      'Monitor consistency score weekly to catch degradation early.',
    )
  } else if (verdict === 'AMBER') {
    recs.push(
      `SLA hit rate is ${Math.round(slaHitRate * 100)}% — identify which agent is causing the most variance.`,
    )
    recs.push(
      'Review the slowest 10% of runs for common patterns (timeouts, retries).',
    )
    recs.push(
      'Consider adding caching or fallback logic to reduce tail latency.',
    )
  } else {
    recs.push(
      `Success rate is only ${Math.round(successRate * 100)}% — immediate investigation needed.`,
    )
    recs.push(
      'Check upstream dependencies (APIs, databases) for reliability issues.',
    )
    recs.push(
      'Consider reducing workflow complexity or splitting into smaller sub-workflows.',
    )
  }
  return recs
}
