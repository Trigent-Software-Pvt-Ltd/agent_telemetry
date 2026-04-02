'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  DollarSign,
  BarChart3,
  Shield,
  AlertTriangle,
  Scale,
  Radio,
  Settings,
  FileText,
  Bot,
  Search,
  ArrowRight,
  X,
} from 'lucide-react'
import { PROCESSES, AGENTS } from '@/lib/mock-data'

interface CommandItem {
  id: string
  name: string
  category: 'Pages' | 'Processes' | 'Agents' | 'Actions'
  href: string
  icon: React.ReactNode
}

const PAGE_ITEMS: CommandItem[] = [
  { id: 'p-dashboard', name: 'Dashboard', category: 'Pages', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'p-roi', name: 'Financial Impact', category: 'Pages', href: '/dashboard/roi', icon: <DollarSign size={16} /> },
  { id: 'p-benchmark', name: 'Benchmarks', category: 'Pages', href: '/dashboard/benchmark', icon: <BarChart3 size={16} /> },
  { id: 'p-audit', name: 'Audit Trail', category: 'Pages', href: '/governance/audit', icon: <Shield size={16} /> },
  { id: 'p-fmea', name: 'Risk Analysis', category: 'Pages', href: '/governance/fmea', icon: <AlertTriangle size={16} /> },
  { id: 'p-rules', name: 'Rules', category: 'Pages', href: '/governance/rules', icon: <Scale size={16} /> },
  { id: 'p-monitor', name: 'Live Monitor', category: 'Pages', href: '/monitoring', icon: <Radio size={16} /> },
  { id: 'p-settings', name: 'Settings', category: 'Pages', href: '/settings', icon: <Settings size={16} /> },
  { id: 'p-export', name: 'Board Report', category: 'Pages', href: '/dashboard/export', icon: <FileText size={16} /> },
]

const PROCESS_ITEMS: CommandItem[] = PROCESSES.map((p) => ({
  id: `proc-${p.id}`,
  name: p.name,
  category: 'Processes' as const,
  href: `/process/${p.id}`,
  icon: <Search size={16} />,
}))

const AGENT_ITEMS: CommandItem[] = AGENTS.map((a) => ({
  id: `agent-${a.id}`,
  name: a.name,
  category: 'Agents' as const,
  href: `/agents/${a.id}`,
  icon: <Bot size={16} />,
}))

const ACTION_ITEMS: CommandItem[] = [
  { id: 'act-report', name: 'Generate Board Report', category: 'Actions', href: '/dashboard/export', icon: <FileText size={16} /> },
  { id: 'act-compare', name: 'Compare Agents', category: 'Actions', href: '/agents/compare', icon: <Scale size={16} /> },
  { id: 'act-alerts', name: 'View Alerts', category: 'Actions', href: '/settings/alerts', icon: <AlertTriangle size={16} /> },
]

const ALL_ITEMS = [...PAGE_ITEMS, ...PROCESS_ITEMS, ...AGENT_ITEMS, ...ACTION_ITEMS]

const CATEGORY_ORDER: CommandItem['category'][] = ['Pages', 'Processes', 'Agents', 'Actions']

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_ITEMS
    const q = query.toLowerCase()
    return ALL_ITEMS.filter((item) => item.name.toLowerCase().includes(q))
  }, [query])

  const grouped = useMemo(() => {
    const groups: { category: string; items: CommandItem[] }[] = []
    for (const cat of CATEGORY_ORDER) {
      const items = filtered.filter((i) => i.category === cat)
      if (items.length > 0) groups.push({ category: cat, items })
    }
    return groups
  }, [filtered])

  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  const navigate = useCallback(
    (item: CommandItem) => {
      onClose()
      setQuery('')
      router.push(item.href)
    },
    [onClose, router],
  )

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [filtered])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % Math.max(flatItems.length, 1))
      }
      if (e.key === 'Enter' && flatItems[activeIndex]) {
        e.preventDefault()
        navigate(flatItems[activeIndex])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, flatItems, activeIndex, navigate])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  let flatIndex = -1

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-fade-up"
        style={{ background: '#FFFFFF', border: '1px solid var(--border)' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, processes, agents, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: 360 }}>
          {flatItems.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.category}>
              <div
                className="px-4 py-2 text-[10px] font-semibold uppercase"
                style={{ color: 'var(--text-muted)', letterSpacing: '0.08em', background: 'var(--surface)' }}
              >
                {group.category}
              </div>
              {group.items.map((item) => {
                flatIndex++
                const isActive = flatIndex === activeIndex
                return (
                  <button
                    key={item.id}
                    data-active={isActive}
                    onClick={() => navigate(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
                    style={{
                      background: isActive ? 'rgba(55, 138, 221, 0.08)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                  >
                    <span style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm">{item.name}</span>
                    {isActive && (
                      <ArrowRight size={14} style={{ color: 'var(--accent-blue)' }} />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center gap-4 px-4 py-2.5 text-[11px]"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>↑↓</kbd>
            {' '}navigate
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Enter</kbd>
            {' '}select
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>Esc</kbd>
            {' '}close
          </span>
        </div>
      </div>
    </div>
  )
}
