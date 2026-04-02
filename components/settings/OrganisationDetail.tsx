'use client'

import { Shield, Activity, HardDrive } from 'lucide-react'

export interface OrgUser {
  name: string
  email: string
  role: 'Admin' | 'Viewer' | 'Analyst'
}

export interface OrgProcess {
  name: string
  status: 'active' | 'paused'
}

export interface Organisation {
  id: string
  name: string
  processes: OrgProcess[]
  agents: number
  weeklyRoi: number
  users: OrgUser[]
  status: 'Active' | 'Suspended'
  apiCallsThisMonth: number
  storageUsedMb: number
  plan: 'Starter' | 'Pro' | 'Enterprise'
}

interface OrganisationDetailProps {
  org: Organisation
}

const roleBadgeColor: Record<string, { bg: string; text: string }> = {
  Admin: { bg: '#FFF5F5', text: '#DC2626' },
  Viewer: { bg: '#E8EEF5', text: '#0A1628' },
  Analyst: { bg: '#FFFBEB', text: '#D97706' },
}

export function OrganisationDetail({ org }: OrganisationDetailProps) {
  return (
    <div
      className="px-6 py-5 animate-fade-up"
      style={{ background: '#F7F9FC', borderTop: '1px solid #E2E8F0' }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users list */}
        <div>
          <h4
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: '#64748B', letterSpacing: '0.08em' }}
          >
            Users
          </h4>
          <div className="space-y-2">
            {org.users.map(user => {
              const badge = roleBadgeColor[user.role] ?? roleBadgeColor.Viewer
              return (
                <div
                  key={user.email}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#0A1628' }}>
                      {user.name}
                    </div>
                    <div className="text-xs" style={{ color: '#64748B' }}>
                      {user.email}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {user.role}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Processes */}
        <div>
          <h4
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: '#64748B', letterSpacing: '0.08em' }}
          >
            Processes
          </h4>
          <div className="space-y-2">
            {org.processes.map(proc => (
              <div
                key={proc.name}
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
              >
                <span className="text-sm" style={{ color: '#0A1628' }}>
                  {proc.name}
                </span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: proc.status === 'active' ? '#ECFDF5' : '#FFFBEB',
                    color: proc.status === 'active' ? '#059669' : '#D97706',
                  }}
                >
                  {proc.status === 'active' ? 'Active' : 'Paused'}
                </span>
              </div>
            ))}
          </div>

          {/* Data isolation */}
          <div className="mt-4">
            <h4
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: '#64748B', letterSpacing: '0.08em' }}
            >
              Data Isolation
            </h4>
            <div
              className="flex items-center gap-2 p-2 rounded-lg"
              style={{ background: '#ECFDF5', border: '1px solid #059669' }}
            >
              <Shield size={14} style={{ color: '#059669' }} />
              <span className="text-xs font-semibold" style={{ color: '#059669' }}>
                Row-level security: Active
              </span>
            </div>
          </div>
        </div>

        {/* Usage stats */}
        <div>
          <h4
            className="text-xs font-semibold uppercase mb-3"
            style={{ color: '#64748B', letterSpacing: '0.08em' }}
          >
            Usage Stats
          </h4>
          <div className="space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
            >
              <Activity size={16} style={{ color: '#0891B2' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                  {org.apiCallsThisMonth.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: '#64748B' }}>API calls this month</div>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
            >
              <HardDrive size={16} style={{ color: '#7C3AED' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: '#0A1628' }}>
                  {org.storageUsedMb >= 1000
                    ? `${(org.storageUsedMb / 1000).toFixed(1)} GB`
                    : `${org.storageUsedMb} MB`}
                </div>
                <div className="text-xs" style={{ color: '#64748B' }}>Storage used</div>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
            >
              <div className="text-xs" style={{ color: '#64748B' }}>
                Plan: <span className="font-semibold" style={{ color: '#0A1628' }}>{org.plan}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
