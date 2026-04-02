'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { CommandPalette } from '@/components/shared/CommandPalette'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  const openPalette = useCallback(() => setCommandPaletteOpen(true), [])
  const closePalette = useCallback(() => setCommandPaletteOpen(false), [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <aside data-sidebar>
        <Sidebar />
      </aside>
      <div style={{ marginLeft: 260 }} data-main>
        <div data-topbar>
          <TopBar onSearchClick={openPalette} />
        </div>
        <main className="p-6">
          {children}
        </main>
      </div>
      <CommandPalette open={commandPaletteOpen} onClose={closePalette} />
    </div>
  )
}
