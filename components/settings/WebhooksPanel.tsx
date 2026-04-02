'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Send, Save, Trash2, Loader2 } from 'lucide-react'

const WEBHOOK_EVENTS = [
  { id: 'agent.quality.changed', label: 'Agent Quality Changed' },
  { id: 'audit.decision.made', label: 'Audit Decision Made' },
  { id: 'roi.updated', label: 'ROI Updated' },
  { id: 'alert.triggered', label: 'Alert Triggered' },
  { id: 'budget.threshold.reached', label: 'Budget Threshold Reached' },
]

interface WebhookConfig {
  id: string
  name: string
  url: string
  events: string[]
}

interface Delivery {
  id: string
  timestamp: string
  event: string
  url: string
  status: number
  responseTime: string
}

const INITIAL_WEBHOOKS: WebhookConfig[] = [
  {
    id: 'wh-1',
    name: 'Production Alerts',
    url: 'https://hooks.example.com/alerts',
    events: ['agent.quality.changed', 'alert.triggered', 'budget.threshold.reached'],
  },
  {
    id: 'wh-2',
    name: 'Audit Stream',
    url: 'https://compliance.example.com/audit',
    events: ['audit.decision.made'],
  },
]

const INITIAL_DELIVERIES: Delivery[] = [
  { id: 'd-1', timestamp: 'Apr 2, 2026 14:32:10', event: 'agent.quality.changed', url: 'https://hooks.example.com/alerts', status: 200, responseTime: '142ms' },
  { id: 'd-2', timestamp: 'Apr 2, 2026 13:18:45', event: 'alert.triggered', url: 'https://hooks.example.com/alerts', status: 200, responseTime: '89ms' },
  { id: 'd-3', timestamp: 'Apr 2, 2026 11:05:22', event: 'audit.decision.made', url: 'https://compliance.example.com/audit', status: 500, responseTime: '2,340ms' },
  { id: 'd-4', timestamp: 'Apr 1, 2026 22:47:31', event: 'budget.threshold.reached', url: 'https://hooks.example.com/alerts', status: 200, responseTime: '67ms' },
  { id: 'd-5', timestamp: 'Apr 1, 2026 19:11:58', event: 'agent.quality.changed', url: 'https://hooks.example.com/alerts', status: 200, responseTime: '113ms' },
]

export function WebhooksPanel() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(INITIAL_WEBHOOKS)
  const [deliveries] = useState<Delivery[]>(INITIAL_DELIVERIES)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newEvents, setNewEvents] = useState<string[]>([])
  const [testingId, setTestingId] = useState<string | null>(null)

  const handleTest = (id: string) => {
    setTestingId(id)
    setTimeout(() => {
      setTestingId(null)
      toast.success('Webhook test successful (200 OK)')
    }, 1500)
  }

  const handleSave = (id: string) => {
    toast.success('Webhook configuration saved')
    void id
  }

  const handleDelete = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id))
    toast.success('Webhook deleted')
  }

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) {
      toast.error('Please enter a name and URL')
      return
    }
    if (newEvents.length === 0) {
      toast.error('Please select at least one event')
      return
    }
    setWebhooks(prev => [...prev, {
      id: `wh-${Date.now()}`,
      name: newName.trim(),
      url: newUrl.trim(),
      events: [...newEvents],
    }])
    setNewName('')
    setNewUrl('')
    setNewEvents([])
    setShowAddForm(false)
    toast.success('Webhook added')
  }

  const toggleEvent = (webhookId: string, eventId: string) => {
    setWebhooks(prev => prev.map(w => {
      if (w.id !== webhookId) return w
      const events = w.events.includes(eventId)
        ? w.events.filter(e => e !== eventId)
        : [...w.events, eventId]
      return { ...w, events }
    }))
  }

  const toggleNewEvent = (eventId: string) => {
    setNewEvents(prev => prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId])
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"

  return (
    <div className="space-y-6">
      {/* Webhook configs */}
      {webhooks.map(wh => (
        <div key={wh.id} className="card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: '#0A1628' }}>{wh.name}</h3>
            <button onClick={() => handleDelete(wh.id)} className="p-1 rounded hover:bg-[#FFF5F5]" style={{ color: '#DC2626' }} title="Delete">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Endpoint URL</label>
            <input
              type="url"
              value={wh.url}
              onChange={e => setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, url: e.target.value } : w))}
              className={inputClass}
              style={{ borderColor: '#E2E8F0', fontFamily: 'var(--font-mono-jb)' }}
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: '#64748B' }}>Events</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WEBHOOK_EVENTS.map(evt => (
                <label key={evt.id} className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: '#0A1628' }}>
                  <input
                    type="checkbox"
                    checked={wh.events.includes(evt.id)}
                    onChange={() => toggleEvent(wh.id, evt.id)}
                    className="rounded"
                    style={{ accentColor: '#D4AF37' }}
                  />
                  <span className="font-[var(--font-mono-jb)] text-xs" style={{ color: '#475569' }}>{evt.id}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTest(wh.id)}
              disabled={testingId === wh.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              style={{ border: '1px solid #E2E8F0', color: '#0A1628' }}
            >
              {testingId === wh.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Test Webhook
            </button>
            <button
              onClick={() => handleSave(wh.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: '#D4AF37', color: '#0A1628' }}
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
      ))}

      {/* Add new webhook */}
      {showAddForm ? (
        <div className="card" style={{ border: '1px solid #D4AF37' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#0A1628' }}>Add Webhook</h3>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Name</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Slack Alerts" className={inputClass} style={{ borderColor: '#E2E8F0' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Endpoint URL</label>
              <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." className={inputClass} style={{ borderColor: '#E2E8F0', fontFamily: 'var(--font-mono-jb)' }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: '#64748B' }}>Events</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map(evt => (
                  <label key={evt.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={newEvents.includes(evt.id)} onChange={() => toggleNewEvent(evt.id)} className="rounded" style={{ accentColor: '#D4AF37' }} />
                    <span className="font-[var(--font-mono-jb)] text-xs" style={{ color: '#475569' }}>{evt.id}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#D4AF37', color: '#0A1628' }}>Add Webhook</button>
            <button onClick={() => { setShowAddForm(false); setNewName(''); setNewUrl(''); setNewEvents([]) }} className="px-4 py-2 rounded-lg text-sm" style={{ color: '#64748B', border: '1px solid #E2E8F0' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold" style={{ background: '#D4AF37', color: '#0A1628' }}>
          <Plus size={16} />
          Add Webhook
        </button>
      )}

      {/* Recent deliveries */}
      <div>
        <h3 className="text-xs font-semibold uppercase mb-3" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Recent Deliveries</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Timestamp</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Event</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>URL</th>
                <th className="text-left py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Status</th>
                <th className="text-right py-2 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Response Time</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id} className="row-hover" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-2 px-3" style={{ color: '#64748B' }}>{d.timestamp}</td>
                  <td className="py-2 px-3">
                    <code className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#475569', fontFamily: 'var(--font-mono-jb)' }}>{d.event}</code>
                  </td>
                  <td className="py-2 px-3 text-xs font-[var(--font-mono-jb)]" style={{ color: '#64748B' }}>{d.url}</td>
                  <td className="py-2 px-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: d.status === 200 ? '#ECFDF5' : '#FFF5F5',
                        color: d.status === 200 ? '#059669' : '#DC2626',
                      }}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums" style={{ color: '#64748B' }}>{d.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
