'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  key: string
  maskedKey: string
  created: string
  lastUsed: string
  status: 'active' | 'revoked'
  showFull: boolean
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production Key',
    key: 'sk_live_vip_9f3k2m8x7h4w1b6z0t5r_abc123',
    maskedKey: 'sk_live_...abc123',
    created: 'Mar 1, 2026',
    lastUsed: 'Apr 1, 2026',
    status: 'active',
    showFull: false,
  },
  {
    id: 'key-2',
    name: 'Development Key',
    key: 'sk_test_vip_4j7n1p5q8v2c6y9a3d0g_def456',
    maskedKey: 'sk_test_...def456',
    created: 'Feb 15, 2026',
    lastUsed: 'Mar 28, 2026',
    status: 'active',
    showFull: false,
  },
]

export function ApiKeysPanel() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS)
  const [showForm, setShowForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)

  const handleGenerate = () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }
    const suffix = Math.random().toString(36).slice(2, 8)
    const fullKey = `sk_live_vip_${Math.random().toString(36).slice(2, 14)}_${suffix}`
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: fullKey,
      maskedKey: `sk_live_...${suffix}`,
      created: 'Apr 2, 2026',
      lastUsed: 'Never',
      status: 'active',
      showFull: true,
    }
    setKeys(prev => [...prev, newKey])
    setNewKeyName('')
    setShowForm(false)
    toast.success('API key generated')
  }

  const handleRevoke = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k))
    setConfirmRevoke(null)
    toast.success('API key revoked')
  }

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key).catch(() => {})
    toast.success('API key copied to clipboard')
  }

  const toggleVisibility = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, showFull: !k.showFull } : k))
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border text-sm font-[var(--font-mono-jb)] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"

  return (
    <div className="space-y-6">
      {/* Rate limit info */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ background: '#FFFBEB', border: '1px solid #D97706', color: '#92400E' }}>
        <span className="font-semibold">Rate Limit:</span> 1,000 requests/hour per key
      </div>

      {/* Keys table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Name</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Key</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Created</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Last Used</th>
              <th className="text-left py-3 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Status</th>
              <th className="text-right py-3 px-3 font-semibold text-xs uppercase" style={{ color: '#64748B', letterSpacing: '0.08em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k.id} className="row-hover" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td className="py-3 px-3 font-medium" style={{ color: '#0A1628' }}>{k.name}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs px-2 py-1 rounded" style={{ background: '#F1F5F9', color: '#475569', fontFamily: 'var(--font-mono-jb)' }}>
                      {k.showFull ? k.key : k.maskedKey}
                    </code>
                    <button onClick={() => toggleVisibility(k.id)} className="p-1 rounded hover:bg-[#F1F5F9]" style={{ color: '#64748B' }} title={k.showFull ? 'Hide' : 'Show'}>
                      {k.showFull ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => handleCopy(k.key)} className="p-1 rounded hover:bg-[#F1F5F9]" style={{ color: '#64748B' }} title="Copy">
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3" style={{ color: '#64748B' }}>{k.created}</td>
                <td className="py-3 px-3" style={{ color: '#64748B' }}>{k.lastUsed}</td>
                <td className="py-3 px-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: k.status === 'active' ? '#ECFDF5' : '#FFF5F5',
                      color: k.status === 'active' ? '#059669' : '#DC2626',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: k.status === 'active' ? '#059669' : '#DC2626' }} />
                    {k.status === 'active' ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {k.status === 'active' && (
                    confirmRevoke === k.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs" style={{ color: '#DC2626' }}>Confirm?</span>
                        <button onClick={() => handleRevoke(k.id)} className="text-xs px-2 py-1 rounded font-semibold" style={{ background: '#FFF5F5', color: '#DC2626' }}>
                          Revoke
                        </button>
                        <button onClick={() => setConfirmRevoke(null)} className="text-xs px-2 py-1 rounded" style={{ color: '#64748B' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRevoke(k.id)} className="p-1.5 rounded hover:bg-[#FFF5F5]" style={{ color: '#DC2626' }} title="Revoke">
                        <Trash2 size={14} />
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate new key */}
      {showForm ? (
        <div className="card" style={{ border: '1px solid #D4AF37' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#0A1628' }}>Generate New API Key</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: '#64748B' }}>Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g. Staging Key"
                className={inputClass}
                style={{ borderColor: '#E2E8F0' }}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: '#D4AF37', color: '#0A1628' }}
            >
              Generate
            </button>
            <button
              onClick={() => { setShowForm(false); setNewKeyName('') }}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ color: '#64748B', border: '1px solid #E2E8F0' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: '#D4AF37', color: '#0A1628' }}
        >
          <Plus size={16} />
          Generate New Key
        </button>
      )}
    </div>
  )
}
