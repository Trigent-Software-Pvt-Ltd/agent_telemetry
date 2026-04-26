'use client'

import { usePathname } from 'next/navigation'
import { useAEOSDemo } from './AEOSDemoProvider'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'

const TITLES: Record<string, string> = {
  '/': 'Mission Control',
  '/decisions': 'Decision Explorer',
  '/eai': 'EAI Board',
  '/ledger': 'Ledger',
  '/policy-packs': 'Policy Packs',
  '/skills': 'Skills Authority',
  '/evidence': 'Evidence Export',
  '/dir': 'Auto-Improvement',
}

const TENANT_LABEL: Record<string, string> = {
  kengarff_automotive: 'Ken Garff Automotive',
  vipsigma_sports_betting: 'VIPSigma Sports Betting',
  artgroup: 'ARTGROUP',
  loop_tv: 'Loop TV',
}

export function AEOSTopBar() {
  const pathname = usePathname()
  const { tenantId } = useAEOSDemo()

  const title =
    Object.entries(TITLES).find(([k]) => k === pathname || (k !== '/' && pathname.startsWith(k)))?.[1] ??
    'AEOS'

  return (
    <div
      className="flex items-center justify-between py-3.5 px-6 bg-white"
      style={{ borderBottom: '1px solid #E8E6E0' }}
    >
      <div className="flex items-center gap-1.5 text-sm">
        <span style={{ color: '#9CA3AF' }}>{TENANT_LABEL[tenantId] ?? tenantId}</span>
        <span style={{ color: '#D1D5DB' }}>/</span>
        <span className="font-semibold" style={{ color: '#111827' }}>{title}</span>
      </div>

      <div className="flex items-center gap-3">
        <TwoPartySignaturePill />
      </div>
    </div>
  )
}
