'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import { listLedgerRows } from '@/lib/aeos/data'
import type { LedgerRow } from '@/types/aeos'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import { TrendingDown, TrendingUp, AlertCircle, Wrench } from 'lucide-react'

const PATH_LABEL: Record<string, string> = {
  human: 'Human',
  anthropic_agent: 'Anthropic',
  openai_agent: 'OpenAI',
  google_vertex_agent: 'Vertex',
  salesforce_agent: 'Agentforce',
  cloudflare_agent: 'Cloudflare',
  uniphore_agent: 'Uniphore',
  hybrid_anthropic_human: 'Anthropic+H',
  hybrid_openai_human: 'OpenAI+H',
}

export default function LedgerPage() {
  const { tenantId } = useAEOSDemo()
  const [breachOnly, setBreachOnly] = useState(false)
  const [withCorrection, setWithCorrection] = useState(false)
  const [drawerRow, setDrawerRow] = useState<LedgerRow | null>(null)

  const rows = useMemo(() => {
    let r = listLedgerRows(tenantId, {
      variance_breach: breachOnly ? true : undefined,
      has_correction: withCorrection ? true : undefined,
    })
    return r.slice(0, 80)
  }, [tenantId, breachOnly, withCorrection])

  const totalRows = listLedgerRows(tenantId).length
  const totalBreach = listLedgerRows(tenantId, { variance_breach: true }).length
  const totalCorrected = listLedgerRows(tenantId, { has_correction: true }).length

  return (
    <div className="space-y-6">
      <header>
        <h1
          className="font-[var(--font-sora)]"
          style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
        >
          Predictive Economic Ledger
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          Append-only · LedgerRow v2.3 · two-party co-signed at every actual.
        </p>
      </header>

      {/* What's in a LedgerRow — the 5 substructures of v2.3 */}
      <div className="card">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          LedgerRow v2.3 · five substructures
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
          Every row carries the full predictive economic story. Click any row for the full structure.
        </div>
        <div className="grid grid-cols-5 gap-3 mt-4">
          <Substructure
            n={1}
            name="Predicted"
            sub="$ at decision time"
            note="Signed by FuzeBox · ed25519"
          />
          <Substructure
            n={2}
            name="Actual"
            sub="$ from external SoR"
            note="Co-signed FuzeBox + rPotential"
          />
          <Substructure
            n={3}
            name="Variance"
            sub="Two-dimensional"
            note="Technical (σ, latency, hallucination) AND economic ($, win rate)"
          />
          <Substructure
            n={4}
            name="Attribution"
            sub="5-bucket classification"
            note="agent_capability · agent_instructions · data · policy · environment"
          />
          <Substructure
            n={5}
            name="Correction"
            sub="L9 DIR patch object"
            note="Auto-fires when attribution = agent_*. Cross-vendor propagation."
          />
        </div>
      </div>

      <div className="aeos-card">
        <div className="flex items-center gap-4 mb-3">
          <Stat label="Total rows" value={totalRows.toString()} />
          <Stat label="Variance breaches" value={totalBreach.toString()} accent="warn" />
          <Stat label="Corrections applied" value={totalCorrected.toString()} accent="ok" />
          <div className="flex-1" />
          <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)' }}>
            <input type="checkbox" checked={breachOnly} onChange={e => setBreachOnly(e.target.checked)} />
            Breach only
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer" style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)' }}>
            <input type="checkbox" checked={withCorrection} onChange={e => setWithCorrection(e.target.checked)} />
            Has correction
          </label>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 600 }}>
          <table className="w-full" style={{ fontSize: 12 }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--aeos-bg-card)' }}>
              <tr style={{ color: 'var(--aeos-fg-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th className="text-left py-2 px-2 font-medium">When</th>
                <th className="text-left py-2 px-2 font-medium">Skill</th>
                <th className="text-left py-2 px-2 font-medium">Vendor</th>
                <th className="text-left py-2 px-2 font-medium">Path</th>
                <th className="text-right py-2 px-2 font-medium">Predicted</th>
                <th className="text-right py-2 px-2 font-medium">Actual</th>
                <th className="text-right py-2 px-2 font-medium">Variance</th>
                <th className="text-left py-2 px-2 font-medium">Attribution</th>
                <th className="text-center py-2 px-2 font-medium">Correction</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const breach = r.variance.technical.exceeds_tolerance || r.variance.economic.exceeds_tolerance
                const variancePct = r.variance.economic.variance_usd / Math.max(0.01, r.predicted.value_usd)
                return (
                  <tr
                    key={r.execution_id}
                    onClick={() => setDrawerRow(r)}
                    style={{ borderTop: '1px solid var(--aeos-border-divider)', cursor: 'pointer' }}
                  >
                    <td className="py-2 px-2 aeos-mono" style={{ color: 'var(--aeos-fg-secondary)', whiteSpace: 'nowrap' }}>
                      {r.timestamp.slice(5, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2 px-2" style={{ color: 'var(--aeos-fg-primary)' }}>
                      {prettySkill(r.skill_id)}
                    </td>
                    <td className="py-2 px-2" style={{ color: 'var(--aeos-fg-secondary)' }}>{r.provider}</td>
                    <td className="py-2 px-2">
                      <span className="aeos-pill" style={{ fontSize: 9 }}>{PATH_LABEL[r.selected_path] ?? r.selected_path}</span>
                    </td>
                    <td className="py-2 px-2 text-right aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>
                      ${r.predicted.value_usd.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>
                      ${r.actual.value_usd.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-right aeos-mono" style={{
                      color: r.variance.economic.variance_usd >= 0
                        ? 'var(--aeos-accent-ok)'
                        : breach ? 'var(--aeos-accent-bad)' : 'var(--aeos-fg-secondary)',
                    }}>
                      {r.variance.economic.variance_usd >= 0 ? '+' : ''}${r.variance.economic.variance_usd.toFixed(2)}
                      <span style={{ fontSize: 9, color: 'var(--aeos-fg-muted)', marginLeft: 4 }}>
                        ({(variancePct * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="py-2 px-2" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
                      {r.attribution.cause ? r.attribution.cause.replace(/_/g, ' ') : '—'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {r.correction.applied_patch_id ? (
                        <span className="aeos-pill" style={{ fontSize: 9, background: 'rgba(110,231,183,0.12)', color: 'var(--aeos-accent-ok)' }}>
                          <Wrench size={9} /> {r.correction.patch_type}
                        </span>
                      ) : breach ? (
                        <AlertCircle size={12} style={{ color: 'var(--aeos-accent-warn)' }} />
                      ) : (
                        <span style={{ color: 'var(--aeos-fg-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {drawerRow && <LedgerRowDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />}
    </div>
  )
}

function Substructure({ n, name, sub, note }: { n: number; name: string; sub: string; note: string }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div
          className="rounded-md flex items-center justify-center font-[var(--font-mono-jb)]"
          style={{
            width: 20,
            height: 20,
            background: 'var(--accent-blue)',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {n}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
        {sub}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
        {note}
      </div>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: 'ok' | 'warn' }) {
  const color = accent === 'ok' ? 'var(--aeos-accent-ok)' : accent === 'warn' ? 'var(--aeos-accent-warn)' : 'var(--aeos-fg-primary)'
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div className="aeos-mono" style={{ fontSize: 18, color, fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function LedgerRowDrawer({ row, onClose }: { row: LedgerRow; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-20 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="aeos-card overflow-y-auto"
        style={{
          width: 520,
          height: '100vh',
          borderRadius: 0,
          padding: 24,
          background: 'var(--aeos-bg-card)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>Ledger Row</div>
            <div className="aeos-mono mt-1" style={{ fontSize: 12, color: 'var(--aeos-fg-primary)' }}>
              {row.execution_id}
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--aeos-fg-muted)', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>

        <Link
          href={`/decisions/${row.decision_id}`}
          className="aeos-pill"
          style={{ fontSize: 10, marginBottom: 16, display: 'inline-block' }}
        >
          Open Decision Explorer →
        </Link>

        <Section title="Predicted">
          <KV k="Value" v={`$${row.predicted.value_usd.toFixed(2)}`} mono />
          <KV k="Signed by" v="FuzeBox · ed25519" />
          <KV k="At" v={row.predicted.signed_at.slice(0, 19).replace('T', ' ')} mono />
        </Section>

        <Section title="Actual">
          <KV k="Value" v={`$${row.actual.value_usd.toFixed(2)}`} mono />
          <KV k="Sourced from" v={row.actual.sourced_from} />
          <div className="mt-2"><TwoPartySignaturePill /></div>
        </Section>

        <Section title="Variance · Technical">
          <KV k="σ delta" v={row.variance.technical.sigma_delta.toFixed(3)} mono />
          <KV k="Latency Δ" v={`${row.variance.technical.latency_delta_ms}ms`} mono />
          <KV k="Hallucination Δ" v={row.variance.technical.hallucination_delta.toFixed(3)} mono />
          <KV k="Exceeds tolerance" v={row.variance.technical.exceeds_tolerance ? 'YES' : 'no'} accent={row.variance.technical.exceeds_tolerance ? 'bad' : undefined} />
        </Section>

        <Section title="Variance · Economic">
          <KV k="Variance $" v={`$${row.variance.economic.variance_usd.toFixed(2)}`} mono />
          <KV k="Variance percentile" v={(row.variance.economic.variance_percentile * 100).toFixed(0) + '%'} mono />
          <KV k="Win rate Δ" v={(row.variance.economic.win_rate_delta * 100).toFixed(1) + '%'} mono />
          <KV k="Exceeds tolerance" v={row.variance.economic.exceeds_tolerance ? 'YES' : 'no'} accent={row.variance.economic.exceeds_tolerance ? 'bad' : undefined} />
        </Section>

        {row.attribution.cause && (
          <Section title="Attribution">
            <KV k="Bucket" v={row.attribution.cause.replace(/_/g, ' ')} accent="warn" />
            <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
              {row.attribution.reasoning}
            </div>
          </Section>
        )}

        {row.correction.applied_patch_id && (
          <Section title="Correction">
            <KV k="Patch type" v={row.correction.patch_type ?? '—'} accent="ok" />
            <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
              {row.correction.patch_summary}
            </div>
            <div className="mt-2"><TwoPartySignaturePill /></div>
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function KV({ k, v, mono, accent }: { k: string; v: string; mono?: boolean; accent?: 'ok' | 'warn' | 'bad' }) {
  const color = accent === 'ok' ? 'var(--aeos-accent-ok)' : accent === 'warn' ? 'var(--aeos-accent-warn)' : accent === 'bad' ? 'var(--aeos-accent-bad)' : 'var(--aeos-fg-primary)'
  return (
    <div className="flex justify-between" style={{ fontSize: 12 }}>
      <span style={{ color: 'var(--aeos-fg-muted)' }}>{k}</span>
      <span className={mono ? 'aeos-mono' : ''} style={{ color }}>{v}</span>
    </div>
  )
}

function prettySkill(skillId: string): string {
  return skillId.replace(/^skill_/, '').replace(/_v\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
