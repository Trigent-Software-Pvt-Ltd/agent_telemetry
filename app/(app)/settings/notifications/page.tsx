'use client'

import { NotificationChannelCard } from '@/components/settings/NotificationChannelCard'
import { NotificationRulesMatrix } from '@/components/settings/NotificationRulesMatrix'
import { RecentNotifications } from '@/components/settings/RecentNotifications'
import { getNotificationChannels } from '@/lib/mock-data'
import { ShareButton } from '@/components/shared/ShareButton'

export default function NotificationsPage() {
  const channels = getNotificationChannels()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
            Notification Channels
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Configure how and when you receive alerts from your agent workflows.
          </p>
        </div>
        <ShareButton pageName="Notifications" />
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {channels.map(ch => (
          <NotificationChannelCard key={ch.id} channel={ch} />
        ))}
      </div>

      {/* Rules Matrix */}
      <NotificationRulesMatrix />

      {/* Recent Notifications */}
      <RecentNotifications />
    </div>
  )
}
