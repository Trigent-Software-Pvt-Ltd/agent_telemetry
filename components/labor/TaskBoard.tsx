import type { OnetTask } from '@/types/telemetry'

interface TaskBoardProps {
  tasks: OnetTask[]
}

function TaskColumn({
  title,
  tasks,
  accentColor,
  barColor,
}: {
  title: string
  tasks: OnetTask[]
  accentColor: string
  barColor: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-3 h-3 rounded-sm"
          style={{ backgroundColor: accentColor }}
        />
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
          {title}
        </h4>
        <span className="text-xs text-text-muted">({tasks.length})</span>
      </div>
      {tasks.map((task) => {
        const pct = Math.round(task.timeWeight * 100)
        return (
          <div
            key={task.id}
            className="card !p-4"
            style={{ borderLeft: `3px solid ${accentColor}` }}
          >
            <p className="text-sm font-medium text-text-primary leading-snug">
              {task.task}
            </p>
            <p className="text-xs text-text-secondary mt-1">{pct}% of role</p>
            <div className="mt-2 h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct * 100 / 20}%`,
                  backgroundColor: barColor,
                  maxWidth: '100%',
                }}
              />
            </div>
            {task.agentName && (
              <p className="text-xs text-text-muted mt-1.5">{task.agentName}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const agentTasks = tasks.filter((t) => t.ownership === 'agent')
  const collabTasks = tasks.filter((t) => t.ownership === 'collaborative')
  const humanTasks = tasks.filter((t) => t.ownership === 'human')

  return (
    <div className="animate-fade-up">
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        Task Allocation
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="Agent Owned"
          tasks={agentTasks}
          accentColor="var(--status-green)"
          barColor="var(--status-green)"
        />
        <TaskColumn
          title="Collaborative"
          tasks={collabTasks}
          accentColor="var(--status-amber)"
          barColor="var(--status-amber)"
        />
        <TaskColumn
          title="Human Retained"
          tasks={humanTasks}
          accentColor="var(--text-muted)"
          barColor="var(--text-muted)"
        />
      </div>
    </div>
  )
}
