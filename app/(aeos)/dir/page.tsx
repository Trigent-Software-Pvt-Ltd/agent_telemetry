'use client'

import { useState } from 'react'
import { listDIRRules } from '@/lib/aeos/data'
import type { DIRRule } from '@/types/aeos'
import { Zap, CheckCircle2, Clock, Lightbulb, FlaskConical, Wrench } from 'lucide-react'

export default function DynamicInstructionsPage() {
  const rules = listDIRRules()
  const [selectedId, setSelectedId] = useState<string>(rules[0]?.rule_id ?? '')
  const selected = rules.find(r => r.rule_id === selectedId)

  const live = rules.filter(r => r.status === 'live')
  const synthesized = rules.filter(r => r.source !== undefined)

  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Dynamic Instructions</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4, fontSize: 14 }}>
          L9 control surface · 6 default rules · self-improving flywheel.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4" style={{ minHeight: 480 }}>
        {/* Rule list */}
        <div className="aeos-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Rules · {rules.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
              {live.length} live · {synthesized.length} synthesized
            </div>
          </div>
          <div style={{ maxHeight: 540, overflowY: 'auto' }}>
            {rules.map(r => (
              <button
                key={r.rule_id}
                type="button"
                onClick={() => setSelectedId(r.rule_id)}
                className="w-full text-left px-4 py-3"
                style={{
                  background: r.rule_id === selectedId ? 'var(--aeos-bg-elevated)' : 'transparent',
                  borderLeft: r.rule_id === selectedId ? '2px solid var(--aeos-accent-primary)' : '2px solid transparent',
                  borderBottom: '1px solid var(--aeos-border-divider)',
                  transition: 'background var(--aeos-motion)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={r.status} />
                  {r.source && (
                    <span className="aeos-pill" style={{ fontSize: 9, color: 'var(--aeos-accent-warn)', borderColor: 'rgba(251,191,36,0.3)' }}>
                      synth
                    </span>
                  )}
                </div>
                <div className="aeos-mono" style={{ fontSize: 11, color: r.rule_id === selectedId ? 'var(--aeos-accent-primary)' : 'var(--aeos-fg-primary)' }}>
                  {r.rule_id}
                </div>
                <div style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)', marginTop: 2, lineHeight: 1.4 }}>
                  {r.description}
                </div>
                <div className="flex items-center gap-3 mt-2" style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>
                  <span>fired {r.fired_last_7d}× / 7d</span>
                  {r.pack_id && <span className="aeos-mono">{r.pack_id}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Rule detail */}
        <div className="col-span-2 aeos-card">
          {selected ? <RuleDetail rule={selected} /> : null}
        </div>
      </div>

      {/* Self-improving flywheel */}
      <div className="aeos-card">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical size={16} style={{ color: 'var(--aeos-accent-warn)' }} />
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Self-Improving Flywheel · Last 30 days
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Aggregated eval failures feed instruction synthesis. Generated rules pass governance review and ship.
          Variance shrinks; the next decision runs under a tighter rule set. The DEODAG loop closes.
        </div>
        <div className="grid grid-cols-3 gap-3">
          {synthesized.map(r => (
            <div key={r.rule_id} className="rounded-md p-3" style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)' }}>
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={r.status} />
                <span style={{ fontSize: 9, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {r.fired_last_7d > 0 ? 'fired' : 'pending'}
                </span>
              </div>
              <div className="aeos-mono" style={{ fontSize: 11, color: 'var(--aeos-accent-primary)' }}>
                {r.rule_id}
              </div>
              <div style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                {r.description}
              </div>
              <div className="mt-2" style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', lineHeight: 1.4 }}>
                <Lightbulb size={10} className="inline" style={{ marginRight: 4 }} />
                {r.source}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3" style={{ fontSize: 11 }}>
          <FlywheelStep n={1} label="Observe" desc="Cross-vendor telemetry normalised" active />
          <FlywheelStep n={2} label="Evaluate" desc="3-tier rubric grades each output" active />
          <FlywheelStep n={3} label="Synthesize" desc="Aggregate failures → DIR rule" active />
          <FlywheelStep n={4} label="Inject" desc="Patch propagates cross-vendor" active />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: DIRRule['status'] }) {
  const map = {
    live: { label: 'live', color: 'var(--aeos-accent-ok)', icon: CheckCircle2 },
    in_review: { label: 'in review', color: 'var(--aeos-accent-warn)', icon: Clock },
    proposed: { label: 'proposed', color: 'var(--aeos-fg-secondary)', icon: Lightbulb },
    synthesized: { label: 'synth', color: 'var(--aeos-accent-warn)', icon: FlaskConical },
  }
  const m = map[status]
  const Icon = m.icon
  return (
    <span className="aeos-pill" style={{ fontSize: 9, color: m.color, borderColor: m.color + '33', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      <Icon size={9} />
      {m.label}
    </span>
  )
}

function RuleDetail({ rule }: { rule: DIRRule }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase' }}>Rule</div>
          <div className="aeos-mono mt-1" style={{ fontSize: 18, color: 'var(--aeos-accent-primary)' }}>{rule.rule_id}</div>
          <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 6, lineHeight: 1.5 }}>
            {rule.description}
          </div>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 rounded-md aeos-mono"
          style={{ background: 'var(--aeos-accent-primary)', color: 'var(--aeos-bg-canvas)', fontSize: 11, fontWeight: 600 }}
        >
          Replay decision
        </button>
      </div>

      <Section title="Trigger predicate">
        <code className="aeos-mono block" style={{ fontSize: 12, color: 'var(--aeos-fg-primary)', background: 'var(--aeos-bg-nested)', padding: 10, borderRadius: 6 }}>
          {rule.trigger}
        </code>
      </Section>

      <Section title="Patch preview">
        {rule.patch_preview.additional_instructions && rule.patch_preview.additional_instructions.length > 0 && (
          <div className="mb-2">
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', marginBottom: 4 }}>ADDITIONAL INSTRUCTIONS</div>
            <ul className="space-y-1">
              {rule.patch_preview.additional_instructions.map((ins, i) => (
                <li key={i} style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', lineHeight: 1.5 }}>• {ins}</li>
              ))}
            </ul>
          </div>
        )}
        {rule.patch_preview.restricted_tools && rule.patch_preview.restricted_tools.length > 0 && (
          <div className="mb-2">
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', marginBottom: 4 }}>RESTRICTED TOOLS</div>
            <div className="flex flex-wrap gap-1">
              {rule.patch_preview.restricted_tools.map(t => (
                <span key={t} className="aeos-pill aeos-mono" style={{ fontSize: 10, color: 'var(--aeos-accent-bad)', borderColor: 'rgba(248,113,113,0.3)' }}>−{t}</span>
              ))}
            </div>
          </div>
        )}
        {rule.patch_preview.required_tools && rule.patch_preview.required_tools.length > 0 && (
          <div className="mb-2">
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', marginBottom: 4 }}>REQUIRED TOOLS</div>
            <div className="flex flex-wrap gap-1">
              {rule.patch_preview.required_tools.map(t => (
                <span key={t} className="aeos-pill aeos-mono" style={{ fontSize: 10, color: 'var(--aeos-accent-ok)', borderColor: 'rgba(110,231,183,0.3)' }}>+{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3 mt-2" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
          {rule.patch_preview.required_citations && <span>✓ citations required</span>}
          {rule.patch_preview.require_human_confirmation && <span>✓ human confirmation</span>}
          {rule.patch_preview.safety_envelope && <span className="aeos-mono">env: {rule.patch_preview.safety_envelope}</span>}
        </div>
      </Section>

      <Section title="Activity">
        <div className="flex gap-6" style={{ fontSize: 12 }}>
          <span style={{ color: 'var(--aeos-fg-muted)' }}>Fired last 7d</span>
          <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{rule.fired_last_7d}</span>
          {rule.pack_id && (
            <>
              <span style={{ color: 'var(--aeos-fg-muted)' }}>· Pack</span>
              <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{rule.pack_id}</span>
            </>
          )}
        </div>
        {rule.source && (
          <div className="mt-3 p-3 rounded-md" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-center gap-2 mb-1" style={{ fontSize: 10, color: 'var(--aeos-accent-warn)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <FlaskConical size={11} />
              Synthesized from
            </div>
            <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)', lineHeight: 1.5 }}>
              {rule.source}
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}>
      <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  )
}

function FlywheelStep({ n, label, desc, active }: { n: number; label: string; desc: string; active: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        className="aeos-mono flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 28,
          height: 28,
          background: active ? 'var(--aeos-accent-primary)' : 'var(--aeos-bg-nested)',
          color: active ? 'var(--aeos-bg-canvas)' : 'var(--aeos-fg-muted)',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {n}
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--aeos-fg-primary)', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  )
}
