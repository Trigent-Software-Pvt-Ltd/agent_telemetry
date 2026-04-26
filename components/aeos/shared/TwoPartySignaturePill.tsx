import { Check } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md'
  showCheck?: boolean
  className?: string
}

export function TwoPartySignaturePill({ size = 'sm', showCheck = true, className = '' }: Props) {
  const h = size === 'sm' ? 22 : 28
  const fs = size === 'sm' ? 10 : 11
  return (
    <div
      className={`flex items-center rounded-full overflow-hidden ${className}`}
      style={{
        height: h,
        border: '1px solid var(--border)',
        fontSize: fs,
        fontWeight: 500,
        background: '#FFFFFF',
      }}
      title="Signed by FuzeBox + rPotential"
    >
      <div
        className="flex items-center gap-1 px-2 h-full"
        style={{ background: 'rgba(29, 158, 117, 0.08)', color: 'var(--status-green)' }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--status-green)' }} />
        FuzeBox
      </div>
      <div
        className="flex items-center gap-1 px-2 h-full"
        style={{
          background: 'rgba(55, 138, 221, 0.08)',
          color: 'var(--accent-blue)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--accent-blue)' }} />
        rPotential
        {showCheck && <Check size={11} style={{ marginLeft: 2, color: 'var(--status-green)' }} />}
      </div>
    </div>
  )
}
