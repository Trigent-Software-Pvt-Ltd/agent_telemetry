'use client'

import type { EAIBreakdown } from '@/types/aeos'

interface Props {
  breakdown: EAIBreakdown
}

/**
 * Shows the EAI formula evaluated step-by-step against this tenant's
 * actual values from the seed ledger. Mirrors the reference Python
 * compute_eai in packages/economic_ledger/metrics.py.
 */
export function EAIComputation({ breakdown: b }: Props) {
  // Mirror eai.ts:
  //   A = ai_share × success × govern × clamp(econ + 0.5, 0, 1.5)
  //   B = hybrid_share × preservation
  //   C1 = control_failures / row_count
  //   C2 = risk_penalties × 0.4
  //   eai = clamp(A + B − C1 − C2, −0.5, 1.5)
  const econNorm = clamp(b.economic_return_factor + 0.5, 0, 1.5)
  const A = b.ai_adjusted_task_share * b.success_rate * b.governance_factor * econNorm
  const B = b.hybrid_execution_share * b.preservation_factor
  const C1 = b.control_failures / Math.max(1, b.row_count)
  const C2 = b.risk_penalties * 0.4
  const raw = A + B - C1 - C2

  return (
    <div className="card">
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        EAI computation
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
        How the headline number is derived from the ledger window — three components, two added,
        two subtracted, clamped to {`[−0.5, 1.5]`}.
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Component
          label="A · AI execution quality"
          tone="positive"
          value={A.toFixed(3)}
          breakdown={[
            { k: 'ai_task_share', v: b.ai_adjusted_task_share, op: '×' },
            { k: 'success_rate', v: b.success_rate, op: '×' },
            { k: 'governance_factor', v: b.governance_factor, op: '×' },
            { k: 'econ_return (clamped)', v: econNorm, op: '=' },
          ]}
        />
        <Component
          label="B · Human preservation lift"
          tone="positive"
          value={B.toFixed(3)}
          breakdown={[
            { k: 'hybrid_share', v: b.hybrid_execution_share, op: '×' },
            { k: 'preservation_factor', v: b.preservation_factor, op: '=' },
          ]}
        />
        <Component
          label="C · Risk drag"
          tone="negative"
          value={(C1 + C2).toFixed(3)}
          breakdown={[
            { k: 'control_failures / rows', v: C1, op: '+' },
            { k: 'risk_penalties × 0.4', v: C2, op: '=' },
          ]}
        />
      </div>

      <div
        className="mt-5 p-4 rounded-lg"
        style={{
          background: 'rgba(55,138,221,0.06)',
          border: '1px solid rgba(55,138,221,0.18)',
        }}
      >
        <div className="flex items-center gap-2 flex-wrap font-[var(--font-mono-jb)] tabular-nums" style={{ fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)' }}>EAI =</span>
          <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>{A.toFixed(3)}</span>
          <span style={{ color: 'var(--text-muted)' }}>+</span>
          <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>{B.toFixed(3)}</span>
          <span style={{ color: 'var(--text-muted)' }}>−</span>
          <span style={{ color: 'var(--status-amber)', fontWeight: 600 }}>{(C1 + C2).toFixed(3)}</span>
          <span style={{ color: 'var(--text-muted)' }}>=</span>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: 18 }}>{b.eai.toFixed(3)}</span>
          {raw !== b.eai && (
            <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 8 }}>
              (raw {raw.toFixed(3)} → clamped to {`[−0.5, 1.5]`})
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
          Computed across {b.row_count} ledger rows · co-signed FuzeBox + rPotential. Single-party
          signatures are structurally refused.
        </div>
      </div>
    </div>
  )
}

function Component({
  label,
  tone,
  value,
  breakdown,
}: {
  label: string
  tone: 'positive' | 'negative'
  value: string
  breakdown: Array<{ k: string; v: number; op: string }>
}) {
  const color = tone === 'positive' ? 'var(--status-green)' : 'var(--status-amber)'
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="font-[var(--font-mono-jb)] tabular-nums mt-2" style={{ fontSize: 22, color, fontWeight: 600 }}>
        {value}
      </div>
      <div className="mt-3 space-y-1">
        {breakdown.map((b, i) => (
          <div key={i} className="flex items-center justify-between font-[var(--font-mono-jb)]" style={{ fontSize: 11 }}>
            <span style={{ color: 'var(--text-muted)' }}>
              <span className="mr-1.5" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{b.op}</span>
              {b.k}
            </span>
            <span className="tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {b.v.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
