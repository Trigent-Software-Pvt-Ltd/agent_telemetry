'use client'

import { useState } from 'react'
import { OrganisationTable } from '@/components/settings/OrganisationTable'
import { CreateOrgForm } from '@/components/settings/CreateOrgForm'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Organisation } from '@/components/settings/OrganisationDetail'

const ORGANISATIONS: Organisation[] = [
  {
    id: 'fuzebox-ai',
    name: 'FuzeBox AI',
    processes: [
      { name: 'Odds Analysis Pipeline', status: 'active' },
      { name: 'Player Engagement Pipeline', status: 'active' },
    ],
    agents: 4,
    weeklyRoi: 2038,
    users: [
      { name: 'Sarah Chen', email: 'sarah@fuzebox.ai', role: 'Admin' },
      { name: 'Marcus Williams', email: 'marcus@fuzebox.ai', role: 'Analyst' },
      { name: 'Priya Patel', email: 'priya@fuzebox.ai', role: 'Analyst' },
      { name: 'James O\'Brien', email: 'james@fuzebox.ai', role: 'Viewer' },
    ],
    status: 'Active',
    apiCallsThisMonth: 124500,
    storageUsedMb: 2340,
    plan: 'Enterprise',
  },
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    processes: [
      { name: 'Content Moderation Pipeline', status: 'active' },
    ],
    agents: 2,
    weeklyRoi: 1200,
    users: [
      { name: 'Tom Richardson', email: 'tom@acmecorp.com', role: 'Admin' },
      { name: 'Lisa Chang', email: 'lisa@acmecorp.com', role: 'Analyst' },
      { name: 'Dev Kumar', email: 'dev@acmecorp.com', role: 'Viewer' },
    ],
    status: 'Active',
    apiCallsThisMonth: 67200,
    storageUsedMb: 890,
    plan: 'Pro',
  },
  {
    id: 'techstart-inc',
    name: 'TechStart Inc',
    processes: [
      { name: 'VIP Support Pipeline', status: 'paused' },
    ],
    agents: 3,
    weeklyRoi: 890,
    users: [
      { name: 'Alex Turner', email: 'alex@techstart.io', role: 'Admin' },
      { name: 'Nina Kowalski', email: 'nina@techstart.io', role: 'Analyst' },
      { name: 'Raj Mehta', email: 'raj@techstart.io', role: 'Viewer' },
      { name: 'Emily Foster', email: 'emily@techstart.io', role: 'Viewer' },
    ],
    status: 'Active',
    apiCallsThisMonth: 34100,
    storageUsedMb: 420,
    plan: 'Starter',
  },
]

export default function OrganisationsPage() {
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = (data: { name: string; adminEmail: string; plan: string }) => {
    toast.success(`Organisation "${data.name}" created`)
    setShowCreate(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold font-[var(--font-sora)]"
          style={{ color: '#0A1628' }}
        >
          Organisation Management
        </h1>
        <button
          onClick={() => setShowCreate(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          style={{ background: '#D4AF37', color: '#FFFFFF' }}
        >
          <Plus size={16} />
          Create Organisation
        </button>
      </div>

      {showCreate && (
        <CreateOrgForm
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      <OrganisationTable
        organisations={ORGANISATIONS}
        currentOrgId="fuzebox-ai"
      />

      {/* Tenant switcher note */}
      <div
        className="card flex items-center gap-3"
        style={{ background: '#FFFBEB', borderColor: '#D97706' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ background: '#D97706', color: '#FFFFFF' }}
        >
          i
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>
            Tenant Switcher
          </div>
          <div className="text-xs" style={{ color: '#64748B' }}>
            Use the &quot;Switch tenant&quot; dropdown in the top bar to switch between
            organisation contexts. All dashboards, workflows, and reports will reflect
            the selected tenant&apos;s data.
          </div>
        </div>
      </div>
    </div>
  )
}
