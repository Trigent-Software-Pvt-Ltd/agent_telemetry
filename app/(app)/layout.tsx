import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <aside data-sidebar>
        <Sidebar />
      </aside>
      <div style={{ marginLeft: 260 }} data-main>
        <div data-topbar>
          <TopBar />
        </div>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
