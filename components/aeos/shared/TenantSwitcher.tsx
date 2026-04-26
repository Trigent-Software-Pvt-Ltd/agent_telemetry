'use client'

import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import type { AEOSTenantId } from '@/types/aeos'
import { ChevronDown } from 'lucide-react'

const TENANTS: Array<{ id: AEOSTenantId; label: string }> = [
  { id: 'kengarff_automotive', label: 'Ken Garff Automotive' },
  { id: 'vipsigma_sports_betting', label: 'VIPSigma Sports Betting' },
  { id: 'artgroup', label: 'ARTGROUP' },
  { id: 'loop_tv', label: 'Loop TV' },
]

export function TenantSwitcher() {
  const { tenantId, setTenantId } = useAEOSDemo()
  return (
    <label
      className="flex items-center justify-between gap-2 w-full px-3 py-2 rounded-md cursor-pointer"
      style={{
        background: 'var(--aeos-bg-canvas)',
        border: '1px solid var(--aeos-border-line)',
        fontSize: 12,
      }}
    >
      <span style={{ color: 'var(--aeos-fg-muted)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Tenant
      </span>
      <select
        value={tenantId}
        onChange={e => setTenantId(e.target.value as AEOSTenantId)}
        className="flex-1 outline-none cursor-pointer"
        style={{
          background: 'transparent',
          color: 'var(--aeos-fg-primary)',
          border: 'none',
          fontSize: 12,
          appearance: 'none',
          textAlign: 'right',
        }}
      >
        {TENANTS.map(t => (
          <option key={t.id} value={t.id} style={{ background: 'var(--aeos-bg-card)' }}>
            {t.label}
          </option>
        ))}
      </select>
      <ChevronDown size={12} style={{ color: 'var(--aeos-fg-muted)' }} />
    </label>
  )
}
