'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { getAgentSlaConfigs, AgentSlaConfig } from '@/lib/mock-data'
import { SlaAgentRow } from './SlaAgentRow'

export function SlaConfigPanel() {
  const [configs, setConfigs] = useState<AgentSlaConfig[]>(() => getAgentSlaConfigs())

  const handleChange = (index: number, updated: AgentSlaConfig) => {
    setConfigs(prev => {
      const next = [...prev]
      next[index] = updated
      return next
    })
  }

  const handleSave = () => {
    toast.success('SLA targets saved')
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-xs font-semibold uppercase"
            style={{ color: '#64748B', letterSpacing: '0.08em' }}
          >
            SLA Configuration
          </h2>
          <p className="text-[12px] mt-1" style={{ color: '#94A3B8' }}>
            Set per-agent SLA targets. Green = meeting SLA, amber = close, red = breaching.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          style={{ background: '#D4AF37', color: '#0A1628' }}
          onMouseOver={e => (e.currentTarget.style.background = '#A8891A')}
          onMouseOut={e => (e.currentTarget.style.background = '#D4AF37')}
        >
          <Save size={16} />
          Save Configuration
        </button>
      </div>

      <div>
        {configs.map((config, i) => (
          <SlaAgentRow
            key={config.agentName}
            config={config}
            onChange={updated => handleChange(i, updated)}
          />
        ))}
      </div>
    </section>
  )
}
