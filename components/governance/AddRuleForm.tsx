'use client'

import { useState } from 'react'
import type { EnforcementLevel } from '@/types/telemetry'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

interface AddRuleFormProps {
  onAdd: (rule: { name: string; condition: string; enforcement: EnforcementLevel; scope: string }) => void
}

export function AddRuleForm({ onAdd }: AddRuleFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('')
  const [enforcement, setEnforcement] = useState<EnforcementLevel>('Warn')
  const [scope, setScope] = useState('all')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !condition.trim()) return
    onAdd({ name: name.trim(), condition: condition.trim(), enforcement, scope })
    toast.success('Rule added')
    setName('')
    setCondition('')
    setEnforcement('Warn')
    setScope('all')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{
          background: 'var(--vip-gold)',
          color: 'var(--vip-navy)',
        }}
      >
        <Plus size={16} />
        Add Rule
      </button>
    )
  }

  const inputStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid var(--vip-border)',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: 'var(--vip-navy)',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold font-[var(--font-sora)]" style={{ color: 'var(--vip-navy)' }}>
          New Governance Rule
        </h3>
        <button onClick={() => setOpen(false)} aria-label="Close form">
          <X size={18} style={{ color: 'var(--vip-muted)' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--vip-muted)' }}>Rule Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="e.g. Max latency threshold" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--vip-muted)' }}>Condition</label>
          <input value={condition} onChange={e => setCondition(e.target.value)} style={inputStyle} placeholder="Describe the rule condition" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--vip-muted)' }}>Enforcement</label>
            <select
              value={enforcement}
              onChange={e => setEnforcement(e.target.value as EnforcementLevel)}
              style={inputStyle}
            >
              <option value="Block">Block</option>
              <option value="Warn">Warn</option>
              <option value="Log">Log</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--vip-muted)' }}>Scope</label>
            <select value={scope} onChange={e => setScope(e.target.value)} style={inputStyle}>
              <option value="all">All Agents</option>
              <option value="odds-analysis">Odds Analysis</option>
              <option value="player-engagement">Player Engagement</option>
              <option value="content-moderation">Content Moderation</option>
              <option value="vip-support">VIP Support</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ color: 'var(--vip-muted)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'var(--vip-gold)', color: 'var(--vip-navy)' }}
          >
            Save Rule
          </button>
        </div>
      </form>
    </div>
  )
}
