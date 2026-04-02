'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Monitor, CheckCircle, XCircle, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { NotificationChannel } from '@/lib/mock-data'

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  slack: MessageSquare,
  teams: Monitor,
}

const FREQUENCIES = ['Real-time', 'Hourly digest', 'Daily digest']

interface Props {
  channel: NotificationChannel
}

export function NotificationChannelCard({ channel }: Props) {
  const [enabled, setEnabled] = useState(channel.enabled)
  const [config, setConfig] = useState(channel.config)

  const Icon = CHANNEL_ICONS[channel.type] ?? Mail

  const handleTestConnection = () => {
    toast.success(`Connection successful — ${channel.label} is reachable`)
  }

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const inputClass =
    'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]'

  return (
    <div
      className="card"
      style={{
        borderColor: enabled ? '#D4AF37' : '#E2E8F0',
        borderWidth: enabled ? 2 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: enabled ? '#FBF5DC' : '#F7F9FC',
              color: enabled ? '#D4AF37' : '#94A3B8',
            }}
          >
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
              {channel.label}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {enabled && channel.status === 'connected' ? (
                <>
                  <CheckCircle size={12} style={{ color: '#059669' }} />
                  <span className="text-[10px] font-semibold" style={{ color: '#059669' }}>Connected</span>
                </>
              ) : (
                <>
                  <XCircle size={12} style={{ color: '#94A3B8' }} />
                  <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>Not configured</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setEnabled(!enabled)}
          className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
          style={{ background: enabled ? '#D4AF37' : '#E2E8F0' }}
          disabled={channel.type === 'email'}
          title={channel.type === 'email' ? 'Email is always enabled' : undefined}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow"
            style={{ left: enabled ? 22 : 2 }}
          />
        </button>
      </div>

      {/* Config fields */}
      <div className="space-y-3">
        {channel.type === 'email' && (
          <>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>
                Email addresses
              </label>
              <input
                type="text"
                value={config.emails ?? ''}
                onChange={e => handleConfigChange('emails', e.target.value)}
                className={inputClass}
                style={{ borderColor: '#E2E8F0' }}
                placeholder="e.g. ops@company.com, team@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>
                Frequency
              </label>
              <select
                value={config.frequency ?? 'Hourly digest'}
                onChange={e => handleConfigChange('frequency', e.target.value)}
                className={`${inputClass} cursor-pointer`}
                style={{ borderColor: '#E2E8F0' }}
              >
                {FREQUENCIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {channel.type === 'slack' && (
          <>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>
                Workspace
              </label>
              <input
                type="text"
                value={config.workspace ?? ''}
                onChange={e => handleConfigChange('workspace', e.target.value)}
                className={inputClass}
                style={{ borderColor: '#E2E8F0' }}
                placeholder="e.g. My Company"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>
                Channel
              </label>
              <input
                type="text"
                value={config.channel ?? ''}
                onChange={e => handleConfigChange('channel', e.target.value)}
                className={inputClass}
                style={{ borderColor: '#E2E8F0' }}
                placeholder="e.g. #ai-alerts"
              />
            </div>
            <button
              onClick={handleTestConnection}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
              style={{ background: '#E8EEF5', color: '#0A1628' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#D4AF37')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E8EEF5')}
            >
              <Zap size={14} />
              Test Connection
            </button>
          </>
        )}

        {channel.type === 'teams' && (
          <>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>
                Webhook URL
              </label>
              <input
                type="text"
                value={config.webhookUrl ?? ''}
                onChange={e => handleConfigChange('webhookUrl', e.target.value)}
                className={inputClass}
                style={{ borderColor: '#E2E8F0' }}
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>
            <button
              onClick={handleTestConnection}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
              style={{ background: '#E8EEF5', color: '#0A1628' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#D4AF37')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E8EEF5')}
            >
              <Zap size={14} />
              Test Connection
            </button>
          </>
        )}
      </div>
    </div>
  )
}
