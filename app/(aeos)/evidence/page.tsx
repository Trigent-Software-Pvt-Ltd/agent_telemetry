'use client'

import { useState } from 'react'
import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import { listEvidenceBundles, exportEvidenceBundle } from '@/lib/aeos/data'
import type { EvidenceBundle, EvidenceFormat } from '@/types/aeos'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import { Download, CheckCircle2, FileArchive, Clock, ShieldCheck } from 'lucide-react'

const FORMATS: Array<{ id: EvidenceFormat; label: string }> = [
  { id: 'eu_ai_act_article_12', label: 'EU AI Act · Article 12' },
  { id: 'wp29', label: 'UNECE WP.29' },
  { id: 'gdpr', label: 'GDPR' },
  { id: 'soc2', label: 'SOC 2' },
]

export default function EvidenceExportPage() {
  const { tenantId } = useAEOSDemo()
  const [bundles, setBundles] = useState(() => listEvidenceBundles(tenantId))
  const [format, setFormat] = useState<EvidenceFormat>('eu_ai_act_article_12')
  const [periodStart, setPeriodStart] = useState('2026-04-01')
  const [periodEnd, setPeriodEnd] = useState('2026-04-25')
  const [exporting, setExporting] = useState(false)
  const [signedReveal, setSignedReveal] = useState<EvidenceBundle | null>(null)

  async function handleExport() {
    setExporting(true)
    const bundle = await exportEvidenceBundle({
      tenant_id: tenantId,
      format,
      period_start: new Date(periodStart).toISOString(),
      period_end: new Date(periodEnd).toISOString(),
    })
    setExporting(false)
    setBundles(b => [bundle, ...b])
    setSignedReveal(bundle)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>Evidence Export</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4, fontSize: 14 }}>
          Two-party signed bundles · 7-year compliance retention.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        {/* Export form */}
        <div className="aeos-card">
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Export bundle
          </div>
          <div className="space-y-3">
            <div>
              <label style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', display: 'block', marginBottom: 4 }}>FORMAT</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as EvidenceFormat)}
                className="w-full px-3 py-2 rounded-md aeos-mono"
                style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)', color: 'var(--aeos-fg-primary)', fontSize: 12 }}
              >
                {FORMATS.map(f => <option key={f.id} value={f.id} style={{ background: 'var(--aeos-bg-card)' }}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', display: 'block', marginBottom: 4 }}>PERIOD START</label>
              <input
                type="date"
                value={periodStart}
                onChange={e => setPeriodStart(e.target.value)}
                className="w-full px-3 py-2 rounded-md aeos-mono"
                style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)', color: 'var(--aeos-fg-primary)', fontSize: 12 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', display: 'block', marginBottom: 4 }}>PERIOD END</label>
              <input
                type="date"
                value={periodEnd}
                onChange={e => setPeriodEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-md aeos-mono"
                style={{ background: 'var(--aeos-bg-nested)', border: '1px solid var(--aeos-border-line)', color: 'var(--aeos-fg-primary)', fontSize: 12 }}
              />
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="w-full px-3 py-2 rounded-md aeos-mono flex items-center justify-center gap-2"
              style={{
                background: 'var(--aeos-accent-primary)',
                color: 'var(--aeos-bg-canvas)',
                fontSize: 13,
                fontWeight: 600,
                opacity: exporting ? 0.5 : 1,
              }}
            >
              <Download size={14} />
              {exporting ? 'Signing bundle…' : 'Export & sign'}
            </button>
            {exporting && (
              <div className="aeos-pulse" style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textAlign: 'center' }}>
                Assembling decisions, instruction patches, ledger trace, policy pack — signing with FuzeBox + rPotential keys…
              </div>
            )}
          </div>
        </div>

        {/* Bundle queue */}
        <div className="col-span-2 aeos-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}>
            <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent bundles · {bundles.length}
            </div>
          </div>
          <div style={{ maxHeight: 540, overflowY: 'auto' }}>
            {bundles.map(b => (
              <div
                key={b.bundle_id}
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: '1px solid var(--aeos-border-divider)' }}
              >
                <FileArchive size={18} style={{ color: 'var(--aeos-accent-primary)' }} />
                <div className="flex-1 min-w-0">
                  <div className="aeos-mono" style={{ fontSize: 12, color: 'var(--aeos-fg-primary)' }}>
                    {b.bundle_id}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)', marginTop: 2 }}>
                    {FORMATS.find(f => f.id === b.format)?.label} · {b.row_count} rows · {b.period_start.slice(0, 10)} → {b.period_end.slice(0, 10)}
                  </div>
                </div>
                <TwoPartySignaturePill />
                <button
                  type="button"
                  onClick={() => setSignedReveal(b)}
                  className="px-2 py-1 rounded-md"
                  style={{ background: 'var(--aeos-bg-nested)', color: 'var(--aeos-fg-secondary)', fontSize: 11, border: '1px solid var(--aeos-border-line)' }}
                >
                  View
                </button>
                <a
                  href={b.signed_url}
                  className="px-2 py-1 rounded-md flex items-center gap-1"
                  style={{ background: 'var(--aeos-bg-nested)', color: 'var(--aeos-accent-primary)', fontSize: 11, border: '1px solid var(--aeos-border-line)', textDecoration: 'none' }}
                  onClick={e => e.preventDefault()}
                >
                  <Download size={11} /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {signedReveal && <SignatureRevealModal bundle={signedReveal} onClose={() => setSignedReveal(null)} />}
    </div>
  )
}

function SignatureRevealModal({ bundle, onClose }: { bundle: EvidenceBundle; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="aeos-card"
        style={{ width: 640, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={18} style={{ color: 'var(--aeos-accent-ok)' }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--aeos-fg-primary)' }}>Two-Party Attestation</span>
            </div>
            <div className="aeos-mono" style={{ fontSize: 12, color: 'var(--aeos-fg-muted)' }}>{bundle.bundle_id}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--aeos-fg-muted)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <SignatureCard
            party="FuzeBox"
            algo={bundle.attestations.fuzebox.algorithm}
            keyId={bundle.attestations.fuzebox.key_id}
            sig={bundle.attestations.fuzebox.signature}
            color="var(--aeos-accent-fuzebox)"
          />
          <SignatureCard
            party="rPotential"
            algo={bundle.attestations.rpotential.algorithm}
            keyId={bundle.attestations.rpotential.key_id}
            sig={bundle.attestations.rpotential.signature}
            color="var(--aeos-accent-rpotential)"
          />
        </div>

        <div className="aeos-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Bundle contents · {bundle.files.length} files
          </div>
          <table className="w-full" style={{ fontSize: 11 }}>
            <tbody>
              {bundle.files.map(f => (
                <tr key={f.path} style={{ borderTop: '1px solid var(--aeos-border-divider)' }}>
                  <td className="py-1.5 aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{f.path}</td>
                  <td className="py-1.5 text-right aeos-mono" style={{ color: 'var(--aeos-fg-muted)' }}>{(f.size_bytes / 1024).toFixed(1)}KB</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-2 mt-3" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)' }}>
            <span>Integrity hash:</span>
            <code className="aeos-mono" style={{ fontSize: 10, color: 'var(--aeos-fg-primary)' }}>
              {bundle.integrity_hash.slice(0, 32)}…
            </code>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between" style={{ fontSize: 11, color: 'var(--aeos-fg-muted)' }}>
          <span><Clock size={11} className="inline" style={{ marginRight: 4 }} />retention 7y · expires {bundle.retention_expires_at.slice(0, 10)}</span>
          <button
            type="button"
            className="aeos-pill"
            style={{ fontSize: 11, color: 'var(--aeos-accent-ok)', borderColor: 'rgba(110,231,183,0.3)' }}
          >
            <CheckCircle2 size={11} /> Verify both signatures
          </button>
        </div>
      </div>
    </div>
  )
}

function SignatureCard({ party, algo, keyId, sig, color }: { party: string; algo: string; keyId: string; sig: string; color: string }) {
  return (
    <div className="rounded-md p-3" style={{ background: 'var(--aeos-bg-nested)', border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color }} />
        <span style={{ fontSize: 12, fontWeight: 500, color }}>{party}</span>
        <CheckCircle2 size={12} style={{ color: 'var(--aeos-accent-ok)', marginLeft: 'auto' }} />
      </div>
      <div className="space-y-1.5" style={{ fontSize: 11 }}>
        <div className="flex justify-between">
          <span style={{ color: 'var(--aeos-fg-muted)' }}>Algorithm</span>
          <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{algo}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: 'var(--aeos-fg-muted)' }}>Key ID</span>
          <span className="aeos-mono" style={{ color: 'var(--aeos-fg-primary)' }}>{keyId}</span>
        </div>
        <div>
          <div style={{ color: 'var(--aeos-fg-muted)', marginBottom: 2 }}>Signature</div>
          <code className="aeos-mono block" style={{ fontSize: 9, color: 'var(--aeos-fg-secondary)', wordBreak: 'break-all', lineHeight: 1.4, maxHeight: 60, overflow: 'hidden' }}>
            {sig.slice(0, 96)}…
          </code>
        </div>
      </div>
    </div>
  )
}
