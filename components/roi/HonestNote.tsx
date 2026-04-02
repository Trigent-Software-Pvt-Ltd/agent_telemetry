import { Info } from 'lucide-react'

export function HonestNote() {
  return (
    <div
      className="rounded-lg border px-5 py-4 flex items-start gap-3"
      style={{
        borderColor: 'var(--accent-blue)',
        background: 'var(--accent-blue-bg)',
      }}
    >
      <Info size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: 2 }} />
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        These figures reflect the real net saving after all human oversight hours, governance review
        time, and AI inference costs are deducted from gross savings.
      </p>
    </div>
  )
}
