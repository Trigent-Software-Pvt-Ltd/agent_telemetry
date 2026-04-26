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
        border: '1px solid var(--aeos-border-line)',
        fontSize: fs,
        fontWeight: 500,
      }}
      title="Signed by FuzeBox + rPotential"
    >
      <div
        className="flex items-center gap-1 px-2 h-full"
        style={{ background: 'rgba(110, 231, 183, 0.12)', color: 'var(--aeos-accent-fuzebox)' }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--aeos-accent-fuzebox)' }} />
        FuzeBox
      </div>
      <div
        className="flex items-center gap-1 px-2 h-full"
        style={{
          background: 'rgba(143, 211, 255, 0.12)',
          color: 'var(--aeos-accent-rpotential)',
          borderLeft: '1px solid var(--aeos-border-line)',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--aeos-accent-rpotential)' }} />
        rPotential
        {showCheck && <Check size={11} style={{ marginLeft: 2 }} />}
      </div>
    </div>
  )
}
