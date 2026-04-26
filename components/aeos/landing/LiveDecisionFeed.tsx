'use client'

import Link from 'next/link'
import type { UEFDecision } from '@/types/aeos'
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'

interface Props {
  decisions: UEFDecision[]
}

const PATH_LABEL: Record<string, string> = {
  human: 'Human',
  anthropic_agent: 'Anthropic',
  openai_agent: 'OpenAI',
  google_vertex_agent: 'Vertex',
  salesforce_agent: 'Agentforce',
  cloudflare_agent: 'Cloudflare',
  uniphore_agent: 'Uniphore',
  hybrid_anthropic_human: 'Anthropic + Human',
  hybrid_openai_human: 'OpenAI + Human',
}

const PATH_COLOR: Record<string, string> = {
  human: 'var(--aeos-accent-ok)',
  anthropic_agent: '#c4a875',
  openai_agent: '#34d399',
  google_vertex_agent: '#a78bfa',
  salesforce_agent: '#60a5fa',
  cloudflare_agent: '#fb923c',
  uniphore_agent: '#f472b6',
  hybrid_anthropic_human: 'var(--aeos-accent-primary)',
  hybrid_openai_human: 'var(--aeos-accent-primary)',
}

export function LiveDecisionFeed({ decisions }: Props) {
  return (
    <div className="aeos-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Decision Feed
          </div>
          <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
            Most recent UEF decisions · {decisions.length} shown
          </div>
        </div>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        <table className="w-full" style={{ fontSize: 12 }}>
          <thead>
            <tr style={{ color: 'var(--aeos-fg-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th className="text-left py-2 px-2 font-medium">When</th>
              <th className="text-left py-2 px-2 font-medium">Skill</th>
              <th className="text-left py-2 px-2 font-medium">Path</th>
              <th className="text-right py-2 px-2 font-medium">Confidence</th>
              <th className="text-right py-2 px-2 font-medium">Patch</th>
            </tr>
          </thead>
          <tbody>
            {decisions.map(d => (
              <tr
                key={d.decision_id}
                style={{ borderTop: '1px solid var(--aeos-border-divider)' }}
              >
                <td className="py-2 px-2 aeos-mono" style={{ color: 'var(--aeos-fg-secondary)' }}>
                  {timeAgo(d.decided_at)}
                </td>
                <td className="py-2 px-2">
                  <Link
                    href={`/decisions/${d.decision_id}`}
                    style={{ color: 'var(--aeos-fg-primary)', textDecoration: 'none' }}
                    className="hover:underline"
                  >
                    {prettySkillName(d.skill_id)}
                  </Link>
                </td>
                <td className="py-2 px-2">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      fontSize: 10,
                      background: 'rgba(255,255,255,0.04)',
                      color: PATH_COLOR[d.selected_path] ?? 'var(--aeos-fg-secondary)',
                      border: `1px solid ${PATH_COLOR[d.selected_path] ?? 'var(--aeos-border-line)'}33`,
                    }}
                  >
                    {PATH_LABEL[d.selected_path] ?? d.selected_path}
                  </span>
                </td>
                <td className="py-2 px-2 text-right aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>
                  {(d.confidence * 100).toFixed(0)}%
                </td>
                <td className="py-2 px-2 text-right" style={{ color: 'var(--aeos-fg-secondary)' }}>
                  {d.applied_patch ? (
                    <span className="aeos-pill" style={{ fontSize: 9 }}>
                      {d.applied_patch.rules_fired.length} fired
                    </span>
                  ) : (
                    <span style={{ color: 'var(--aeos-fg-muted)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime()
  const now = new Date('2026-04-26T12:00:00Z').getTime()
  const diffM = Math.round((now - t) / 60_000)
  if (diffM < 60) return `${diffM}m ago`
  const diffH = Math.round(diffM / 60)
  if (diffH < 24) return `${diffH}h ago`
  return `${Math.round(diffH / 24)}d ago`
}

function prettySkillName(skillId: string): string {
  return skillId
    .replace(/^skill_/, '')
    .replace(/_v\d+$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}
