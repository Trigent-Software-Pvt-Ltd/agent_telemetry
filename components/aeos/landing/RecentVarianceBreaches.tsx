'use client'

import Link from 'next/link'
import type { LedgerRow } from '@/types/aeos'
import { AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react'

interface Props {
  rows: LedgerRow[]
}

export function RecentVarianceBreaches({ rows }: Props) {
  const breaches = rows
    .filter(r => r.variance.technical.exceeds_tolerance || r.variance.economic.exceeds_tolerance)
    .slice(0, 6)

  const totalBreaches = rows.filter(r => r.variance.technical.exceeds_tolerance || r.variance.economic.exceeds_tolerance).length
  const totalCorrections = rows.filter(r => r.correction.applied_patch_id).length

  return (
    <div className="aeos-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Variance Breaches · 30d
          </div>
          <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
            {totalBreaches} breaches · <span style={{ color: 'var(--aeos-accent-ok)' }}>{totalCorrections} corrections applied</span> ·{' '}
            <span style={{ color: 'var(--aeos-accent-ok)' }}>variance trending ↓</span>
          </div>
        </div>
        <Link href="/ledger?breach=true" style={{ fontSize: 11, color: 'var(--aeos-accent-primary)' }}>
          View all <ArrowRight size={11} className="inline" />
        </Link>
      </div>
      <div className="space-y-2">
        {breaches.map(r => (
          <Link
            key={r.execution_id}
            href={`/decisions/${r.decision_id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
            style={{
              background: 'var(--aeos-bg-nested)',
              border: '1px solid var(--aeos-border-line)',
              fontSize: 12,
              textDecoration: 'none',
            }}
          >
            <AlertTriangle size={14} style={{ color: 'var(--aeos-accent-warn)' }} />
            <span style={{ color: 'var(--aeos-fg-primary)', flex: 1 }}>{prettySkill(r.skill_id)}</span>
            <span className="aeos-mono" style={{ color: r.variance.economic.variance_usd < 0 ? 'var(--aeos-accent-bad)' : 'var(--aeos-accent-ok)' }}>
              {r.variance.economic.variance_usd > 0 ? '+' : ''}${r.variance.economic.variance_usd.toFixed(2)}
            </span>
            {r.correction.applied_patch_id && (
              <span className="aeos-pill" style={{ fontSize: 9 }}>
                <TrendingDown size={9} /> patched
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

function prettySkill(skillId: string): string {
  return skillId.replace(/^skill_/, '').replace(/_v\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
