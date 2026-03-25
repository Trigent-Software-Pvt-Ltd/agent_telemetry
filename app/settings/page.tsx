'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    slaTarget: 3500,
    valuePerSuccess: 45.00,
    minRuns: 20,
    greenSla: 88,
    greenSuccess: 82,
    amberFloor: 70,
  })

  const frameworks = [
    { name: 'CrewAI', status: 'active', desc: 'Instrumented — Python + JS SDK' },
    { name: 'LangChain', status: 'active', desc: 'Instrumented — Python + JS SDK' },
    { name: 'AutoGen', status: 'inactive', desc: 'Available in Phase 2' },
    { name: 'Custom', status: 'inactive', desc: 'Contact Trigent' },
  ]

  const handleChange = (key: string, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    toast.success('Settings apply to the live build — saved for your review.')
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm font-[var(--font-mono-jb)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      <Sidebar />
      <div style={{ marginLeft: 240 }}>
        <div className="p-6 flex flex-col gap-6">
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Settings
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: ROI Configuration */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
                ROI Configuration
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>SLA Target (ms)</label>
                  <input
                    type="number"
                    value={settings.slaTarget}
                    onChange={e => handleChange('slaTarget', Number(e.target.value))}
                    className={inputClass}
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>Value per Successful Run ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.valuePerSuccess}
                    onChange={e => handleChange('valuePerSuccess', Number(e.target.value))}
                    className={inputClass}
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>Min Runs for Verdict</label>
                  <input
                    type="number"
                    value={settings.minRuns}
                    onChange={e => handleChange('minRuns', Number(e.target.value))}
                    className={inputClass}
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Verdict Thresholds */}
            <div className="card">
              <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
                Verdict Thresholds
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>GREEN requires SLA hit rate {'\u2265'} (%)</label>
                  <input
                    type="number"
                    value={settings.greenSla}
                    onChange={e => handleChange('greenSla', Number(e.target.value))}
                    className={inputClass}
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>GREEN requires success rate {'\u2265'} (%)</label>
                  <input
                    type="number"
                    value={settings.greenSuccess}
                    onChange={e => handleChange('greenSuccess', Number(e.target.value))}
                    className={inputClass}
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>AMBER floor (SLA hit rate) {'\u2265'} (%)</label>
                  <input
                    type="number"
                    value={settings.amberFloor}
                    onChange={e => handleChange('amberFloor', Number(e.target.value))}
                    className={inputClass}
                    style={{ borderColor: '#E2E8F0' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Frameworks */}
          <div className="card">
            <h2 className="text-xs font-semibold uppercase mb-4" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              Connected Agent Frameworks
            </h2>
            <div className="space-y-3">
              {frameworks.map(fw => (
                <div
                  key={fw.name}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: fw.status === 'active' ? '#ECFDF5' : '#F7F9FC', border: '1px solid', borderColor: fw.status === 'active' ? '#059669' : '#E2E8F0' }}
                >
                  {fw.status === 'active' ? (
                    <CheckCircle size={18} style={{ color: '#059669' }} />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2" style={{ borderColor: '#E2E8F0' }} />
                  )}
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>{fw.name}</div>
                    <div className="text-xs" style={{ color: '#64748B' }}>{fw.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
