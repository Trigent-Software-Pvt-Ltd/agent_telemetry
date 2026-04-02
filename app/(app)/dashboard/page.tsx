import type { Metadata } from 'next'
import { PROCESSES } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Dashboard' }
import { HeroBanner } from '@/components/dashboard/HeroBanner'
import { HealthSummary } from '@/components/dashboard/HealthSummary'
import { AttentionRequired } from '@/components/dashboard/AttentionRequired'
import { ProcessCard } from '@/components/dashboard/ProcessCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { InsightCards } from '@/components/dashboard/InsightCards'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. Narrative hero banner */}
      <HeroBanner />

      {/* 2. Health summary (replaces binary healthy/unhealthy) */}
      <HealthSummary />

      {/* 3. Attention required — above process cards */}
      <AttentionRequired />

      {/* 4. Simplified process cards */}
      <div className="flex flex-col gap-4">
        {PROCESSES.map((process) => (
          <ProcessCard key={process.id} process={process} />
        ))}
      </div>

      {/* 5. Quick actions */}
      <QuickActions />

      {/* 6. Bottom insight cards */}
      <InsightCards />
    </div>
  )
}
