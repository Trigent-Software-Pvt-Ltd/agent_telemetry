'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { getDecision, getLedgerRow } from '@/lib/aeos/data'
import type { ScoredPath, UEFDecision, LedgerRow } from '@/types/aeos'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import { CheckCircle2, AlertTriangle, Zap, ShieldCheck, Cpu, Bot, User, ArrowDown } from 'lucide-react'

const RPOTENTIAL_DIMS = ['gsti_value', 'uop_value', 'coordination_tax'] as const

const DIM_LABELS: Array<{ key: keyof ScoredPath; label: string; isRpotential?: boolean; subtract?: boolean }> = [
  { key: 'capability_fit', label: 'Cap. fit' },
  { key: 'gsti_value', label: 'GSTI', isRpotential: true },
  { key: 'uop_value', label: 'UoP', isRpotential: true },
  { key: 'coordination_tax', label: 'Coord. tax', isRpotential: true, subtract: true },
  { key: 'governance_score', label: 'Govern.' },
  { key: 'runtime_fit', label: 'Runtime' },
  { key: 'economic_value', label: 'Econ.' },
  { key: 'risk_penalty', label: 'Risk', subtract: true },
]

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

export default function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const decision = getDecision(id)
  if (!decision) return notFound()
  const row = getLedgerRow(decision.execution_id)

  const winnerScore = decision.scored_paths[0]?.total ?? 0

  return (
    <div className="space-y-6">
      {/* Task header */}
      <div className="aeos-card">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Decision · {decision.decision_id}
            </div>
            <h2 className="mt-1" style={{ fontSize: 18, color: 'var(--aeos-fg-primary)', fontWeight: 500 }}>
              {decision.task.description}
            </h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap" style={{ fontSize: 11 }}>
              <span className="aeos-pill">{decision.task.task_type}</span>
              <RiskPill level={decision.task.risk_level} />
              <span className="aeos-pill">{decision.task.regulatory_class}</span>
              <span className="aeos-pill">{decision.task.jurisdiction}</span>
              {decision.task.human_signoff_required && (
                <span className="aeos-pill"><User size={9} /> human sign-off required</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md aeos-mono"
            style={{ background: 'var(--aeos-accent-primary)', color: 'var(--aeos-bg-canvas)', fontSize: 12, fontWeight: 600 }}
          >
            Re-run
          </button>
        </div>
      </div>

      {/* Top row: UEF result + Adapter result */}
      <div className="grid grid-cols-2 gap-4">
        <div className="aeos-card">
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>UEF Decision</div>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="aeos-mono" style={{ fontSize: 24, color: 'var(--aeos-accent-primary)' }}>
              {PATH_LABEL[decision.selected_path] ?? decision.selected_path}
            </span>
          </div>
          <div className="flex gap-4 mt-3" style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--aeos-fg-muted)' }}>Confidence</span>
            <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{(decision.confidence * 100).toFixed(0)}%</span>
            <span style={{ color: 'var(--aeos-fg-muted)' }}>· Score</span>
            <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{winnerScore.toFixed(2)}</span>
            {decision.selected_actor_id && (
              <>
                <span style={{ color: 'var(--aeos-fg-muted)' }}>· Actor</span>
                <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{decision.selected_actor_id}</span>
              </>
            )}
          </div>
        </div>
        <div className="aeos-card">
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>Adapter Result</div>
          <div className="flex items-baseline gap-3 mt-2">
            <Bot size={20} style={{ color: 'var(--aeos-accent-primary)' }} />
            <span className="aeos-mono" style={{ fontSize: 16, color: 'var(--aeos-fg-primary)' }}>
              {decision.vendor_layer?.model_id ?? decision.selected_path}
            </span>
          </div>
          <div className="flex gap-4 mt-3" style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--aeos-fg-muted)' }}>Latency</span>
            <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{decision.expected_metrics.latency_ms}ms</span>
            <span style={{ color: 'var(--aeos-fg-muted)' }}>· Cost</span>
            <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>${decision.expected_metrics.cost_usd.toFixed(2)}</span>
            <span style={{ color: 'var(--aeos-fg-muted)' }}>· Success p</span>
            <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{(decision.expected_metrics.success_probability * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Scored paths */}
      <div className="aeos-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>Scored Paths · 8 dimensions</div>
            <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
              Three columns labeled <span style={{ color: 'var(--aeos-accent-rpotential)' }}>● rPotential</span> are exclusive to the workforce-graph layer.
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full aeos-mono" style={{ fontSize: 12 }}>
            <thead>
              <tr style={{ color: 'var(--aeos-fg-muted)', fontSize: 10 }}>
                <th className="text-left py-2 px-2 font-medium">Path</th>
                {DIM_LABELS.map(d => (
                  <th
                    key={d.key as string}
                    className="text-right py-2 px-2 font-medium"
                    style={{
                      color: d.isRpotential ? 'var(--aeos-accent-rpotential)' : 'var(--aeos-fg-muted)',
                    }}
                  >
                    {d.subtract ? '−' : '+'}{d.label}
                  </th>
                ))}
                <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--aeos-fg-primary)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {decision.scored_paths.map((sp, i) => {
                const isWinner = sp.path === decision.selected_path
                return (
                  <tr
                    key={sp.path}
                    style={{
                      borderTop: '1px solid var(--aeos-border-divider)',
                      background: isWinner ? 'rgba(55,138,221,0.06)' : 'transparent',
                    }}
                  >
                    <td className="py-2 px-2 font-sans" style={{ color: isWinner ? 'var(--aeos-accent-primary)' : 'var(--aeos-fg-primary)', fontWeight: isWinner ? 600 : 400 }}>
                      {isWinner && '▶ '}{PATH_LABEL[sp.path] ?? sp.path}
                    </td>
                    {DIM_LABELS.map(d => {
                      const v = sp[d.key] as number
                      return (
                        <td
                          key={d.key as string}
                          className="text-right py-2 px-2"
                          style={{
                            color: d.isRpotential ? 'var(--aeos-accent-rpotential)' : 'var(--aeos-fg-secondary)',
                          }}
                        >
                          {v.toFixed(2)}
                        </td>
                      )
                    })}
                    <td className="text-right py-2 px-2" style={{ color: isWinner ? 'var(--aeos-accent-primary)' : 'var(--aeos-fg-primary)', fontWeight: isWinner ? 600 : 500 }}>
                      {sp.total.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', marginTop: 12, lineHeight: 1.6 }}>
          {decision.scored_paths[0]?.justification}
        </div>
      </div>

      {/* DIR patch + Policy evaluation */}
      <div className="grid grid-cols-2 gap-4">
        {decision.applied_patch ? (
          <DIRPatchCard patch={decision.applied_patch} />
        ) : (
          <div className="aeos-card">
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>DIR Patch</div>
            <div className="mt-2" style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)' }}>
              No rules fired — task within nominal parameters.
            </div>
          </div>
        )}
        <PolicyCard requiredControls={decision.required_controls} packId={decision.policy_pack_id} />
      </div>

      {/* Cross-vendor patch preview */}
      {decision.applied_patch?.vendor_translations && (
        <div className="aeos-card">
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>Cross-Vendor Patch Translation</div>
          <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 2, marginBottom: 12 }}>
            The same canonical patch, translated for three vendor surfaces. Patches propagate cross-vendor.
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(['anthropic', 'openai', 'google_vertex'] as const).map(v => (
              <div key={v} className="rounded-md p-3" style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)' }}>
                <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {v.replace('_', ' ')}
                </div>
                <pre className="aeos-mono" style={{ fontSize: 10.5, color: 'var(--aeos-fg-secondary)', whiteSpace: 'pre-wrap', marginTop: 6, lineHeight: 1.5 }}>
                  {decision.applied_patch?.vendor_translations?.[v]}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger row card */}
      {row && (
        <div className="aeos-card">
          <div className="flex items-start justify-between">
            <div>
              <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>Ledger Row</div>
              <div className="aeos-mono mt-1" style={{ fontSize: 12, color: 'var(--aeos-fg-primary)' }}>
                {row.execution_id}
              </div>
            </div>
            <TwoPartySignaturePill size="md" />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <KVPair label="Predicted" value={`$${row.predicted.value_usd.toFixed(2)}`} />
            <KVPair label="Actual" value={`$${row.actual.value_usd.toFixed(2)}`} sourcedFrom={row.actual.sourced_from} />
            <KVPair
              label="Variance"
              value={`${row.variance.economic.variance_usd >= 0 ? '+' : ''}$${row.variance.economic.variance_usd.toFixed(2)}`}
              accent={row.variance.economic.variance_usd >= 0 ? 'ok' : row.variance.economic.exceeds_tolerance ? 'bad' : 'muted'}
            />
          </div>
          {row.attribution.cause && (
            <div className="mt-4 p-3 rounded-md" style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)' }}>
              <div className="flex items-center gap-2" style={{ fontSize: 11 }}>
                <AlertTriangle size={12} style={{ color: 'var(--aeos-accent-warn)' }} />
                <span style={{ color: 'var(--aeos-accent-warn)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attribution</span>
                <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{row.attribution.cause.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                {row.attribution.reasoning}
              </div>
            </div>
          )}
          {row.correction.applied_patch_id && (
            <VarianceShrinkageStrip row={row} />
          )}
        </div>
      )}
    </div>
  )
}

function RiskPill({ level }: { level: string }) {
  const color =
    level === 'critical' ? 'var(--aeos-accent-bad)' :
    level === 'high' ? 'var(--aeos-accent-warn)' :
    level === 'medium' ? 'var(--aeos-fg-secondary)' :
    'var(--aeos-fg-muted)'
  return (
    <span className="aeos-pill" style={{ color, borderColor: color }}>
      {level} risk
    </span>
  )
}

function DIRPatchCard({ patch }: { patch: NonNullable<UEFDecision['applied_patch']> }) {
  return (
    <div className="aeos-card">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={14} style={{ color: 'var(--aeos-accent-warn)' }} />
        <span style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          DIR Patch · pre_input · {patch.contract_version}
        </span>
      </div>
      <div className="space-y-2 mt-3" style={{ fontSize: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>RULES FIRED ({patch.rules_fired.length})</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {patch.rules_fired.map(r => (
              <span key={r} className="aeos-pill aeos-mono" style={{ fontSize: 10 }}>{r}</span>
            ))}
          </div>
        </div>
        {patch.additional_instructions.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>ADDITIONAL INSTRUCTIONS</div>
            <ul className="mt-1 space-y-1">
              {patch.additional_instructions.map((ins, i) => (
                <li key={i} style={{ color: 'var(--aeos-fg-secondary)', lineHeight: 1.5 }}>• {ins}</li>
              ))}
            </ul>
          </div>
        )}
        {patch.restricted_tools.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>RESTRICTED TOOLS</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {patch.restricted_tools.map(t => (
                <span key={t} className="aeos-pill aeos-mono" style={{ fontSize: 10, color: 'var(--aeos-accent-bad)', borderColor: 'rgba(248,113,113,0.3)' }}>−{t}</span>
              ))}
            </div>
          </div>
        )}
        {patch.required_tools.length > 0 && (
          <div>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>REQUIRED TOOLS</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {patch.required_tools.map(t => (
                <span key={t} className="aeos-pill aeos-mono" style={{ fontSize: 10, color: 'var(--aeos-accent-ok)', borderColor: 'rgba(110,231,183,0.3)' }}>+{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 pt-2" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
          {patch.required_citations && (
            <span><CheckCircle2 size={11} style={{ color: 'var(--aeos-accent-ok)', display: 'inline', marginRight: 4 }} />citations required</span>
          )}
          {patch.require_human_confirmation && (
            <span><User size={11} style={{ color: 'var(--aeos-accent-ok)', display: 'inline', marginRight: 4 }} />human confirm</span>
          )}
          {patch.safety_envelope && (
            <span className="aeos-mono">env: {patch.safety_envelope}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function PolicyCard({ requiredControls, packId }: { requiredControls: string[]; packId: string }) {
  return (
    <div className="aeos-card">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={14} style={{ color: 'var(--aeos-accent-ok)' }} />
        <span style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Policy Evaluation
        </span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <CheckCircle2 size={14} style={{ color: 'var(--aeos-accent-ok)' }} />
        <span className="aeos-mono" style={{ fontSize: 14, color: 'var(--aeos-accent-ok)' }}>ALLOW</span>
        <span className="aeos-pill aeos-mono" style={{ fontSize: 10 }}>{packId}</span>
      </div>
      <div className="mt-3">
        <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>REQUIRED CONTROLS ({requiredControls.length})</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {requiredControls.map(c => (
            <span key={c} className="aeos-pill aeos-mono" style={{ fontSize: 10 }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function KVPair({
  label,
  value,
  sourcedFrom,
  accent,
}: {
  label: string
  value: string
  sourcedFrom?: string
  accent?: 'ok' | 'bad' | 'muted'
}) {
  const color =
    accent === 'ok' ? 'var(--aeos-accent-ok)' :
    accent === 'bad' ? 'var(--aeos-accent-bad)' :
    accent === 'muted' ? 'var(--aeos-fg-muted)' :
    'var(--aeos-fg-primary)'
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div className="aeos-mono mt-1" style={{ fontSize: 22, color }}>{value}</div>
      {sourcedFrom && (
        <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', marginTop: 2 }}>
          from {sourcedFrom}
        </div>
      )}
    </div>
  )
}

function VarianceShrinkageStrip({ row }: { row: LedgerRow }) {
  return (
    <div className="mt-4 p-3 rounded-md" style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)' }}>
      <div className="flex items-center gap-2 mb-3" style={{ fontSize: 11 }}>
        <CheckCircle2 size={12} style={{ color: 'var(--aeos-accent-ok)' }} />
        <span style={{ color: 'var(--aeos-accent-ok)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Self-improving</span>
        <span style={{ color: 'var(--aeos-fg-secondary)' }}>— variance shrinkage timeline</span>
      </div>
      <div className="grid grid-cols-5 gap-2" style={{ fontSize: 10 }}>
        <Step label="Original" value={`predicted $${row.predicted.value_usd.toFixed(0)}`} />
        <Step label="Variance breach" value={`$${row.variance.economic.variance_usd.toFixed(0)} off`} accent="warn" />
        <Step label="Attribution" value={row.attribution.cause?.replace(/_/g, ' ') ?? '—'} />
        <Step label={`DIR · ${row.correction.patch_type}`} value={row.correction.patch_summary?.slice(0, 28) + '…'} accent="primary" />
        <Step label="Next 5 runs" value="variance ↓ 73%" accent="ok" />
      </div>
    </div>
  )
}

function Step({ label, value, accent }: { label: string; value: string; accent?: 'ok' | 'warn' | 'primary' }) {
  const color =
    accent === 'ok' ? 'var(--aeos-accent-ok)' :
    accent === 'warn' ? 'var(--aeos-accent-warn)' :
    accent === 'primary' ? 'var(--aeos-accent-primary)' :
    'var(--aeos-fg-secondary)'
  return (
    <div className="text-center">
      <div style={{ color: 'var(--aeos-fg-muted)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div className="aeos-mono mt-1" style={{ color, fontSize: 11 }}>{value}</div>
    </div>
  )
}
