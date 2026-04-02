import { SettingsForm } from '@/components/settings/SettingsForm'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-sora)]">Settings</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Organisation configuration and integrations.
        </p>
      </div>

      {/* Form */}
      <SettingsForm />
    </div>
  )
}
