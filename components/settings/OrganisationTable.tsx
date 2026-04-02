'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { OrganisationDetail } from './OrganisationDetail'
import type { Organisation } from './OrganisationDetail'

interface OrganisationTableProps {
  organisations: Organisation[]
  currentOrgId: string
}

export function OrganisationTable({ organisations, currentOrgId }: OrganisationTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header row */}
      <div
        className="grid items-center px-6 py-3 text-[10px] font-semibold uppercase"
        style={{
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
          color: '#64748B',
          letterSpacing: '0.08em',
          background: '#F7F9FC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <span>Organisation</span>
        <span>Processes</span>
        <span>Agents</span>
        <span>Weekly ROI</span>
        <span>Users</span>
        <span>Status</span>
        <span>Actions</span>
      </div>

      {/* Rows */}
      {organisations.map(org => {
        const isCurrent = org.id === currentOrgId
        const isExpanded = expandedId === org.id

        return (
          <div key={org.id}>
            <div
              className="grid items-center px-6 py-4 cursor-pointer transition-colors row-hover"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
                borderBottom: isExpanded ? 'none' : '1px solid #E2E8F0',
                background: isCurrent ? 'rgba(212,175,55,0.04)' : 'transparent',
              }}
              onClick={() => toggle(org.id)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown size={14} style={{ color: '#64748B' }} />
                ) : (
                  <ChevronRight size={14} style={{ color: '#64748B' }} />
                )}
                <span className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                  {org.name}
                </span>
                {isCurrent && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: '#D4AF37', color: '#FFFFFF' }}
                  >
                    CURRENT
                  </span>
                )}
              </div>
              <span className="text-sm" style={{ color: '#0A1628' }}>
                {org.processes.length}
              </span>
              <span className="text-sm" style={{ color: '#0A1628' }}>
                {org.agents}
              </span>
              <span
                className="text-sm font-semibold font-[var(--font-mono-jb)]"
                style={{ color: '#059669' }}
              >
                ${org.weeklyRoi.toLocaleString()}/wk
              </span>
              <span className="text-sm" style={{ color: '#0A1628' }}>
                {org.users.length}
              </span>
              <span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: org.status === 'Active' ? '#ECFDF5' : '#FFF5F5',
                    color: org.status === 'Active' ? '#059669' : '#DC2626',
                  }}
                >
                  {org.status}
                </span>
              </span>
              <span>
                <button
                  className="text-xs px-3 py-1 rounded-md border cursor-pointer transition-colors"
                  style={{ borderColor: '#E2E8F0', color: '#64748B' }}
                  onClick={e => {
                    e.stopPropagation()
                    toggle(org.id)
                  }}
                >
                  {isExpanded ? 'Collapse' : 'Details'}
                </button>
              </span>
            </div>

            {isExpanded && <OrganisationDetail org={org} />}
          </div>
        )
      })}
    </div>
  )
}
