import { PROCESSES } from '@/lib/mock-data'
import { MetricCards } from '@/components/dashboard/MetricCards'
import { ProcessCard } from '@/components/dashboard/ProcessCard'
import { InsightCards } from '@/components/dashboard/InsightCards'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          Executive Portfolio
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Overview of all processes and agent performance.
        </p>
      </div>

      {/* Top-level metrics */}
      <MetricCards />

      {/* Process summary cards */}
      <div className="flex flex-col gap-4">
        {PROCESSES.map((process) => (
          <ProcessCard key={process.id} process={process} />
        ))}
      </div>

      {/* Bottom insight cards */}
      <InsightCards />
    </div>
  )
}
