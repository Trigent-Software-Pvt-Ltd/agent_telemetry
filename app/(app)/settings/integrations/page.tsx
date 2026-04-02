'use client'

import { useState } from 'react'
import { ApiKeysPanel } from '@/components/settings/ApiKeysPanel'
import { WebhooksPanel } from '@/components/settings/WebhooksPanel'
import { BiToolsPanel } from '@/components/settings/BiToolsPanel'
import { Key, Webhook, BarChart3 } from 'lucide-react'
import clsx from 'clsx'

type TabId = 'api-keys' | 'webhooks' | 'bi-tools'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'api-keys', label: 'API Keys', icon: <Key size={16} /> },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={16} /> },
  { id: 'bi-tools', label: 'BI Tools', icon: <BarChart3 size={16} /> },
]

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('api-keys')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          Integrations
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748B' }}>
          Manage API keys, webhooks, and BI tool connections
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#E8EEF5', width: 'fit-content' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            )}
            style={{
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#0A1628' : '#64748B',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(10,22,40,0.1)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-up">
        {activeTab === 'api-keys' && (
          <div className="card">
            <h2 className="text-xs font-semibold uppercase mb-5" style={{ color: '#64748B', letterSpacing: '0.08em' }}>
              API Key Management
            </h2>
            <ApiKeysPanel />
          </div>
        )}
        {activeTab === 'webhooks' && <WebhooksPanel />}
        {activeTab === 'bi-tools' && <BiToolsPanel />}
      </div>
    </div>
  )
}
