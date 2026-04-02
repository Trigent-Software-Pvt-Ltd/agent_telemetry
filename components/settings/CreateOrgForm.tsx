'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface CreateOrgFormProps {
  onClose: () => void
  onCreate: (data: { name: string; adminEmail: string; plan: string }) => void
}

export function CreateOrgForm({ onClose, onCreate }: CreateOrgFormProps) {
  const [name, setName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [plan, setPlan] = useState('Pro')

  const inputClass =
    'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !adminEmail.trim()) return
    onCreate({ name: name.trim(), adminEmail: adminEmail.trim(), plan })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-xs font-semibold uppercase"
          style={{ color: '#64748B', letterSpacing: '0.08em' }}
        >
          Create Organisation
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-md cursor-pointer transition-colors"
          style={{ color: '#64748B' }}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>
            Organisation Name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. NewCo Ltd"
            className={inputClass}
            style={{ borderColor: '#E2E8F0' }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>
            Admin Email
          </label>
          <input
            type="email"
            value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)}
            placeholder="admin@example.com"
            className={inputClass}
            style={{ borderColor: '#E2E8F0' }}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block" style={{ color: '#0A1628' }}>
            Plan
          </label>
          <select
            value={plan}
            onChange={e => setPlan(e.target.value)}
            className={inputClass}
            style={{ borderColor: '#E2E8F0' }}
          >
            <option value="Starter">Starter</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            style={{ background: '#D4AF37', color: '#FFFFFF' }}
          >
            Create Organisation
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-colors"
            style={{ borderColor: '#E2E8F0', color: '#64748B' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
