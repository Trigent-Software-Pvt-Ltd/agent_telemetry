import clsx from 'clsx'

/**
 * Small "LIVE" pill with a pulsing green dot. Used in Sourcing Agent and
 * Candidate Review headers when the page is reading from the live backend.
 */
export default function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase',
        className,
      )}
      style={{
        background: 'rgba(29,158,117,0.12)',
        color: '#1D9E75',
        border: '1px solid rgba(29,158,117,0.35)',
      }}
      title="Rendering live data from the Sourcing Agent backend"
    >
      <span
        aria-hidden
        className="status-dot-green"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#1D9E75',
          display: 'inline-block',
        }}
      />
      Live
    </span>
  )
}
