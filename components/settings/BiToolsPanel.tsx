'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BarChart3, PieChart, TrendingUp, Copy, Check } from 'lucide-react'
import { IntegrationWizard } from './IntegrationWizard'

interface BiConnection {
  name: string
  connected: boolean
  icon: React.ReactNode
  color: string
}

const DATA_DICTIONARY = [
  { name: 'sigma_score', description: 'Process capability score (1-6 sigma)', type: 'float', refresh: 'Every 5 min', example: '4.2' },
  { name: 'success_rate', description: 'Percentage of successful runs', type: 'float', refresh: 'Real-time', example: '0.87' },
  { name: 'cost_per_run', description: 'Average cost per workflow execution', type: 'float', refresh: 'Every 5 min', example: '0.0234' },
  { name: 'roi_weekly', description: 'Weekly return on investment ratio', type: 'float', refresh: 'Hourly', example: '3.42' },
  { name: 'override_rate', description: 'Human override frequency', type: 'float', refresh: 'Every 15 min', example: '0.12' },
  { name: 'avg_latency_ms', description: 'Average end-to-end latency in milliseconds', type: 'integer', refresh: 'Real-time', example: '1842' },
  { name: 'sla_hit_rate', description: 'Percentage of runs within SLA target', type: 'float', refresh: 'Real-time', example: '0.91' },
  { name: 'total_cost', description: 'Cumulative cost across all runs', type: 'float', refresh: 'Every 5 min', example: '1.17' },
  { name: 'verdict', description: 'Current workflow health verdict', type: 'enum', refresh: 'Real-time', example: 'GREEN' },
  { name: 'agent_efficiency', description: 'Per-agent cost efficiency score', type: 'float', refresh: 'Every 15 min', example: '0.78' },
]

const EMBED_CODE = `<iframe
  src="https://telemetry.vipplay.ai/embed/dashboard"
  width="100%"
  height="600"
  frameborder="0"
  allow="clipboard-write"
  style="border: 1px solid #E2E8F0; border-radius: 12px;"
></iframe>`

export function BiToolsPanel() {
  const [connections, setConnections] = useState<BiConnection[]>([
    { name: 'Power BI', connected: false, icon: <BarChart3 size={20} />, color: '#F2C811' },
    { name: 'Tableau', connected: false, icon: <PieChart size={20} />, color: '#E97627' },
    { name: 'Looker', connected: false, icon: <TrendingUp size={20} />, color: '#4285F4' },
  ])
  const [copied, setCopied] = useState(false)

  const handleConnect = (name: string) => {
    setConnections(prev => prev.map(c => c.name === name ? { ...c, connected: true } : c))
  }

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(EMBED_CODE).catch(() => {})
    setCopied(true)
    toast.success('Embed code copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* BI Tool Wizards */}
      <div>
        <h3 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Connect BI Tools
        </h3>
        <div className="space-y-4">
          {connections.map(conn => (
            <IntegrationWizard
              key={conn.name}
              toolName={conn.name}
              toolIcon={conn.icon}
              toolColor={conn.color}
              connected={conn.connected}
              onConnect={() => handleConnect(conn.name)}
            />
          ))}
        </div>
      </div>

      {/* Data Dictionary */}
      <div>
        <h3 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Data Dictionary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Metric</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Description</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Type</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Refresh Rate</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Example</th>
              </tr>
            </thead>
            <tbody>
              {DATA_DICTIONARY.map(metric => (
                <tr key={metric.name} className="row-hover" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-2 px-3">
                    <code className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: '#F1F5F9', color: '#0A1628', fontFamily: 'var(--font-mono-jb)' }}>
                      {metric.name}
                    </code>
                  </td>
                  <td className="py-2 px-3" style={{ color: '#475569' }}>{metric.description}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#E8EEF5', color: '#1E3A5F' }}>{metric.type}</span>
                  </td>
                  <td className="py-2 px-3" style={{ color: '#64748B' }}>{metric.refresh}</td>
                  <td className="py-2 px-3 font-[var(--font-mono-jb)] text-xs" style={{ color: '#64748B' }}>{metric.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embed Dashboard */}
      <div>
        <h3 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
          Embed Dashboard
        </h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex items-center justify-between px-4 py-2" style={{ background: '#0A1628' }}>
            <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>HTML</span>
            <button
              onClick={handleCopyEmbed}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{ color: '#D4AF37', background: 'rgba(212,175,55,0.1)' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 text-xs overflow-x-auto" style={{ background: '#1E293B', color: '#E2E8F0', fontFamily: 'var(--font-mono-jb)' }}>
            {EMBED_CODE}
          </pre>
        </div>
      </div>
    </div>
  )
}
