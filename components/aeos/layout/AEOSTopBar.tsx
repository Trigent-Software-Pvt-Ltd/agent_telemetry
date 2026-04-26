'use client'

import { usePathname } from 'next/navigation'
import { useAEOSDemo } from './AEOSDemoProvider'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import { RotateCcw } from 'lucide-react'

const TITLES: Record<string, string> = {
  '/': 'Mission Control',
  '/decisions': 'Decision Explorer',
  '/eai': 'EAI Board',
  '/ledger': 'Ledger',
  '/policy-packs': 'Policy Packs',
  '/skills': 'Skills Authority',
  '/evidence': 'Evidence Export',
  '/dir': 'Dynamic Instructions',
}

const TENANT_LABEL: Record<string, string> = {
  kengarff_automotive: 'Ken Garff Automotive',
  vipsigma_sports_betting: 'VIPSigma Sports Betting',
  artgroup: 'ARTGROUP',
  loop_tv: 'Loop TV',
}

export function AEOSTopBar() {
  const pathname = usePathname()
  const { tenantId, beat, isPlaying, reset } = useAEOSDemo()

  const title =
    Object.entries(TITLES).find(([k]) => k === pathname || (k !== '/' && pathname.startsWith(k)))?.[1] ??
    'AEOS'

  return (
    <div
      className="flex items-center justify-between py-3.5 px-6 bg-white"
      style={{ borderBottom: '1px solid #E8E6E0' }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span style={{ color: '#9CA3AF' }}>{TENANT_LABEL[tenantId] ?? tenantId}</span>
        <span style={{ color: '#D1D5DB' }}>/</span>
        <span className="font-semibold" style={{ color: '#111827' }}>{title}</span>
      </div>

      <div className="flex items-center gap-3">
        {isPlaying && <DemoTimelineScrubber beat={beat} />}
        <TwoPartySignaturePill />
        {isPlaying && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 12,
              background: 'var(--surface)',
            }}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

const BEATS: Array<{ key: string; label: string; t: string }> = [
  { key: 'opening', label: 'Hero', t: '0:00' },
  { key: 'injecting', label: 'Inject', t: '0:15' },
  { key: 'exploring', label: 'Explore', t: '0:25' },
  { key: 'patching', label: 'Patch', t: '0:40' },
  { key: 'policy', label: 'Policy', t: '0:55' },
  { key: 'signing', label: 'Sign', t: '1:10' },
  { key: 'zoomed', label: 'Zoom', t: '1:25' },
]

function DemoTimelineScrubber({ beat }: { beat: string }) {
  const idx = BEATS.findIndex(b => b.key === beat)
  return (
    <div className="flex items-center gap-2">
      {BEATS.map((b, i) => (
        <div
          key={b.key}
          className="flex flex-col items-center gap-0.5"
          style={{ minWidth: 36, opacity: i <= idx ? 1 : 0.3 }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: i === idx ? '#378ADD' : i < idx ? '#1D9E75' : '#9CA3AF',
            }}
          />
          <span style={{ fontSize: 9, color: '#9CA3AF' }}>{b.t}</span>
        </div>
      ))}
    </div>
  )
}
