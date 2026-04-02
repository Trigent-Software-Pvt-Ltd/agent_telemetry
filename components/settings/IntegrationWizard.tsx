'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, ChevronRight, Loader2 } from 'lucide-react'

interface IntegrationWizardProps {
  toolName: string
  toolIcon: React.ReactNode
  toolColor: string
  connected: boolean
  onConnect: () => void
}

const DATASETS = [
  { id: 'workflow_metrics', label: 'Workflow Metrics' },
  { id: 'run_traces', label: 'Run Traces' },
  { id: 'cost_analytics', label: 'Cost Analytics' },
  { id: 'verdict_history', label: 'Verdict History' },
  { id: 'agent_performance', label: 'Agent Performance' },
  { id: 'sla_compliance', label: 'SLA Compliance' },
]

export function IntegrationWizard({ toolName, toolIcon, toolColor, connected, onConnect }: IntegrationWizardProps) {
  const [step, setStep] = useState(0)
  const [endpoint, setEndpoint] = useState('')
  const [token, setToken] = useState('')
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleTest = () => {
    if (!endpoint.trim() || !token.trim() || selectedDatasets.length === 0) {
      toast.error('Please complete all steps first')
      return
    }
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      onConnect()
      toast.success(`${toolName} connected successfully`)
      setExpanded(false)
    }, 2000)
  }

  const toggleDataset = (id: string) => {
    setSelectedDatasets(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"

  const steps = [
    { title: 'Enter Endpoint URL', done: endpoint.trim().length > 0 },
    { title: 'Paste Auth Token', done: token.trim().length > 0 },
    { title: 'Select Datasets', done: selectedDatasets.length > 0 },
  ]

  return (
    <div className="card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${toolColor}15`, color: toolColor }}>
            {toolIcon}
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#0A1628' }}>{toolName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full" style={{ background: connected ? '#059669' : '#94A3B8' }} />
              <span className="text-xs" style={{ color: connected ? '#059669' : '#94A3B8' }}>
                {connected ? 'Connected' : 'Not configured'}
              </span>
            </div>
          </div>
        </div>
        <ChevronRight
          size={18}
          style={{ color: '#64748B', transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </div>

      {expanded && (
        <div className="mt-5 space-y-4">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: step === i ? '#D4AF37' : s.done ? '#059669' : '#E2E8F0',
                    color: step === i || s.done ? '#FFF' : '#64748B',
                  }}
                >
                  {s.done && step !== i ? <Check size={12} /> : i + 1}
                </div>
                <span className="text-xs" style={{ color: step === i ? '#0A1628' : '#64748B' }}>{s.title}</span>
                {i < 2 && <div className="w-8 h-px" style={{ background: '#E2E8F0' }} />}
              </div>
            ))}
          </div>

          {/* Step 1: Endpoint */}
          <div className={step === 0 ? '' : 'hidden'}>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>{toolName} Endpoint URL</label>
            <input
              type="url"
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder={`https://${toolName.toLowerCase().replace(/\s/g, '')}.example.com/api/v1`}
              className={inputClass}
              style={{ borderColor: '#E2E8F0', fontFamily: 'var(--font-mono-jb)' }}
            />
            <button
              onClick={() => setStep(1)}
              disabled={!endpoint.trim()}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
              style={{ background: '#D4AF37', color: '#0A1628' }}
            >
              Next
            </button>
          </div>

          {/* Step 2: Auth Token */}
          <div className={step === 1 ? '' : 'hidden'}>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Authentication Token</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Paste your API token..."
              className={inputClass}
              style={{ borderColor: '#E2E8F0', fontFamily: 'var(--font-mono-jb)' }}
            />
            <div className="flex gap-2 mt-3">
              <button onClick={() => setStep(0)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#64748B', border: '1px solid #E2E8F0' }}>Back</button>
              <button onClick={() => setStep(2)} disabled={!token.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40" style={{ background: '#D4AF37', color: '#0A1628' }}>Next</button>
            </div>
          </div>

          {/* Step 3: Datasets */}
          <div className={step === 2 ? '' : 'hidden'}>
            <label className="text-xs font-medium mb-2 block" style={{ color: '#64748B' }}>Select Datasets to Sync</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DATASETS.map(ds => (
                <label key={ds.id} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#0A1628' }}>
                  <input type="checkbox" checked={selectedDatasets.includes(ds.id)} onChange={() => toggleDataset(ds.id)} style={{ accentColor: '#D4AF37' }} />
                  {ds.label}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#64748B', border: '1px solid #E2E8F0' }}>Back</button>
              <button
                onClick={handleTest}
                disabled={selectedDatasets.length === 0 || testing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                style={{ background: '#059669', color: '#FFF' }}
              >
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Test Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
