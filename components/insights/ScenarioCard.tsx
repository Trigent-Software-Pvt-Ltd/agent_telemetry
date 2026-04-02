'use client'

interface Props {
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
}

export function ScenarioCard({ title, subtitle, icon, children }: Props) {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(55, 138, 221, 0.1)', color: '#378ADD' }}
        >
          {icon}
        </div>
        <div>
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {subtitle}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}
