import { AlertTriangle } from 'lucide-react'

export function AuditAlert() {
  return (
    <div
      className="rounded-lg border px-5 py-4 flex items-start gap-3"
      style={{
        background: 'var(--status-amber-bg)',
        borderColor: 'var(--status-amber)',
      }}
    >
      <AlertTriangle
        size={20}
        style={{ color: 'var(--status-amber)', flexShrink: 0, marginTop: 2 }}
      />
      <div className="flex flex-col gap-1 text-sm" style={{ color: 'var(--text-primary)' }}>
        <p>
          <strong>High override rate</strong> on &lsquo;Generate client recommendations&rsquo;{' '}
          <span style={{ color: 'var(--status-amber)' }}>(40% override rate)</span>
        </p>
        <p>
          Agent quality score: <strong>2.9&#963;</strong> &mdash; below your 4.0&#963; target.
          Review recommended.
        </p>
      </div>
    </div>
  )
}
