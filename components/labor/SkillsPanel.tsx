const OLD_SKILLS = [
  { name: 'Odds calculation', changed: true },
  { name: 'Market interpretation', changed: true },
  { name: 'Competitor research', changed: true },
  { name: 'Data entry', changed: true },
  { name: 'Report generation', changed: true },
  { name: 'Client communication', changed: false },
  { name: 'Regulatory knowledge', changed: false },
]

const NEW_SKILLS = [
  { name: 'AI output review', isNew: true },
  { name: 'Exception escalation', isNew: true },
  { name: 'Prompt interpretation', isNew: true },
  { name: 'Audit trail documentation', isNew: true },
  { name: 'Client communication', isNew: false },
  { name: 'Regulatory knowledge', isNew: false },
]

export default function SkillsPanel() {
  return (
    <div className="animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        Skills Transition
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old Skills */}
        <div className="card">
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            Skills the role used to require
          </h4>
          <ul className="space-y-2">
            {OLD_SKILLS.map((skill) => (
              <li key={skill.name} className="flex items-center gap-2 text-sm">
                {skill.changed ? (
                  <span className="text-status-red text-xs">&#10005;</span>
                ) : (
                  <span className="text-status-green text-xs">&#10003;</span>
                )}
                <span
                  className={
                    skill.changed
                      ? 'text-text-muted line-through'
                      : 'text-text-primary'
                  }
                >
                  {skill.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* New Skills */}
        <div className="card">
          <h4 className="text-sm font-semibold text-text-primary mb-3">
            New skills the role now requires
          </h4>
          <ul className="space-y-2">
            {NEW_SKILLS.map((skill) => (
              <li key={skill.name} className="flex items-center gap-2 text-sm">
                {skill.isNew ? (
                  <span
                    className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase"
                    style={{
                      backgroundColor: 'var(--accent-blue-bg)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    New
                  </span>
                ) : (
                  <span className="text-text-muted text-xs">[unchanged]</span>
                )}
                <span className="text-text-primary">{skill.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
