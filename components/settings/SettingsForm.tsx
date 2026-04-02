'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ORGANISATION } from '@/lib/mock-data'
import { useOrganisation } from '@/hooks/useOrganisation'

const inputStyle: React.CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  color: 'var(--text-primary)',
  background: '#fff',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#64748B',
  marginBottom: 4,
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3
      className="text-sm font-bold uppercase tracking-[0.06em] pt-2 pb-1"
      style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}
    >
      {title}
    </h3>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
}

export function SettingsForm() {
  const { qualityFramework, setQualityFramework } = useOrganisation()
  const [name, setName] = useState(ORGANISATION.name)
  const [industry, setIndustry] = useState(ORGANISATION.industry)
  const [sigmaTarget, setSigmaTarget] = useState(ORGANISATION.sigmaTarget)
  const [langMode, setLangMode] = useState<'operations' | 'quality'>('operations')
  const [alertSigma, setAlertSigma] = useState(3.5)
  const [alertRoi, setAlertRoi] = useState(true)

  return (
    <div className="card flex flex-col gap-6 max-w-3xl">
      {/* Organisation settings */}
      <SectionHeading title="Organisation settings" />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Industry</label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={inputStyle}
          >
            <option>Gaming / Sports Betting</option>
            <option>Financial Services</option>
            <option>Healthcare</option>
            <option>Retail / E-commerce</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Quality framework</label>
          <select
            value={qualityFramework}
            onChange={(e) => setQualityFramework(e.target.value as 'oee' | 'servqual')}
            style={inputStyle}
          >
            <option value="oee">OEE</option>
            <option value="servqual">SERVQUAL</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Quality target: {sigmaTarget.toFixed(1)}&#963;</label>
          <input
            type="range"
            min={1}
            max={6}
            step={0.1}
            value={sigmaTarget}
            onChange={(e) => setSigmaTarget(Number(e.target.value))}
            className="w-full accent-[var(--accent-blue)]"
            style={{ accentColor: 'var(--accent-blue)' }}
          />
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>1.0&#963;</span>
            <span>6.0&#963;</span>
          </div>
        </div>
      </div>

      {/* Agent telemetry */}
      <SectionHeading title="Agent telemetry" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: 'var(--status-green)' }}
          />
          <span className="text-sm font-medium">Langfuse connection:</span>
          <span className="text-sm" style={{ color: 'var(--status-green)' }}>
            Connected &mdash; {ORGANISATION.langfuse.host}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Project</label>
            <input type="text" value={ORGANISATION.langfuse.project} readOnly style={{ ...inputStyle, background: 'var(--surface)' }} />
          </div>
          <div className="flex flex-col gap-1">
            <label style={labelStyle}>Last sync</label>
            <input type="text" value={formatDate(ORGANISATION.langfuse.lastSync)} readOnly style={{ ...inputStyle, background: 'var(--surface)' }} />
          </div>
        </div>
      </div>

      {/* O*NET configuration */}
      <SectionHeading title="O*NET configuration" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: 'var(--status-green)' }}
          />
          <span className="text-sm font-medium">Account:</span>
          <span className="text-sm" style={{ color: 'var(--status-green)' }}>
            Registered &mdash; {ORGANISATION.onet.host}
          </span>
        </div>
        <div className="flex flex-col gap-1" style={{ maxWidth: 280 }}>
          <label style={labelStyle}>Last refresh</label>
          <input type="text" value={formatDate(ORGANISATION.onet.lastRefresh)} readOnly style={{ ...inputStyle, background: 'var(--surface)' }} />
        </div>
      </div>

      {/* Language preference */}
      <SectionHeading title="Language preference" />
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Default mode</label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="langMode"
              value="operations"
              checked={langMode === 'operations'}
              onChange={() => setLangMode('operations')}
              style={{ accentColor: 'var(--accent-blue)' }}
            />
            Operations
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="langMode"
              value="quality"
              checked={langMode === 'quality'}
              onChange={() => setLangMode('quality')}
              style={{ accentColor: 'var(--accent-blue)' }}
            />
            Quality
          </label>
        </div>
      </div>

      {/* Notification thresholds */}
      <SectionHeading title="Notification thresholds" />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Alert when agent drops below</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={6}
              step={0.1}
              value={alertSigma}
              onChange={(e) => setAlertSigma(Number(e.target.value))}
              style={{ ...inputStyle, width: 80 }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>&#963;</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label style={labelStyle}>Alert when ROI turns negative</label>
          <button
            type="button"
            onClick={() => setAlertRoi(!alertRoi)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
            style={{
              background: alertRoi ? 'var(--status-green)' : 'var(--border)',
            }}
          >
            <span
              className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
              style={{
                transform: alertRoi ? 'translateX(24px)' : 'translateX(4px)',
              }}
            />
          </button>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {alertRoi ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Save */}
      <div className="pt-2">
        <button
          onClick={() => toast.success('Settings saved')}
          className="rounded-lg px-6 py-2.5 text-sm font-bold text-white transition-all cursor-pointer"
          style={{ background: 'var(--accent-blue)' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
        >
          Save settings
        </button>
      </div>
    </div>
  )
}
