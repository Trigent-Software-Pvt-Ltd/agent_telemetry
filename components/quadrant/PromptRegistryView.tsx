'use client'

import { useMemo, useState } from 'react'
import type { PromptVersion } from '@/lib/quadrant-mock'
import { GitCommit } from 'lucide-react'

export default function PromptRegistryView({ versions }: { versions: PromptVersion[] }) {
  const inUse = versions.find(v => v.inUse)!
  const [selected, setSelected] = useState(inUse.version)
  const [diffAgainst, setDiffAgainst] = useState(versions[0].version)

  const selectedVersion = versions.find(v => v.version === selected)!
  const diffVersion = versions.find(v => v.version === diffAgainst)!

  const diffLines = useMemo(() => computeLineDiff(diffVersion.body, selectedVersion.body), [diffVersion, selectedVersion])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="card p-6">
        <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Chief of Staff
        </div>
        <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-sora)' }}>
          Prompt Registry
        </h1>
        <p className="text-sm mt-2 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
          Versioned system prompts for the Chief of Staff briefing synthesis. Each briefing records the prompt
          version it ran under.
        </p>
      </div>

      {/* Version timeline */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-sora)' }}>
          Version timeline
        </h3>
        <div className="space-y-2">
          {versions.map(v => (
            <button
              key={v.version}
              onClick={() => setSelected(v.version)}
              className="w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer"
              style={{
                background: selected === v.version ? 'rgba(55, 138, 221, 0.08)' : 'transparent',
                border: `1px solid ${selected === v.version ? '#378ADD' : 'var(--border)'}`,
              }}
            >
              <GitCommit size={14} style={{ color: selected === v.version ? '#378ADD' : 'var(--text-muted)' }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-sm">{v.version}</span>
                  {v.inUse && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#1D9E75', color: 'white' }}
                    >
                      In use
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {v.date} · {v.author}
                  </span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {v.summary}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Viewer + Diff */}
      <div className="grid grid-cols-2 gap-4">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora)' }}>
              Prompt body — {selectedVersion.version}
            </h3>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {selectedVersion.body.split('\n').length} lines
            </div>
          </div>
          <pre
            className="text-xs font-mono overflow-auto p-3 rounded whitespace-pre-wrap"
            style={{ background: 'var(--surface-muted, #0f1117)', color: '#D1D5DB', maxHeight: 560 }}
          >
            {selectedVersion.body}
          </pre>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-sora)' }}>
              Diff vs
            </h3>
            <select
              value={diffAgainst}
              onChange={e => setDiffAgainst(e.target.value)}
              className="text-xs px-2 py-1 rounded border"
              style={{ borderColor: 'var(--border)' }}
            >
              {versions
                .filter(v => v.version !== selected)
                .map(v => (
                  <option key={v.version} value={v.version}>
                    {v.version}
                  </option>
                ))}
            </select>
          </div>
          <div
            className="text-xs font-mono overflow-auto p-3 rounded"
            style={{ background: 'var(--surface-muted, #0f1117)', maxHeight: 560 }}
          >
            {diffLines.map((l, i) => (
              <div
                key={i}
                style={{
                  background:
                    l.kind === 'add'
                      ? 'rgba(29,158,117,0.22)'
                      : l.kind === 'remove'
                        ? 'rgba(226,75,74,0.22)'
                        : 'transparent',
                  color:
                    l.kind === 'add' ? '#6EE7B7' : l.kind === 'remove' ? '#FCA5A5' : '#D1D5DB',
                  whiteSpace: 'pre-wrap',
                  paddingLeft: 6,
                }}
              >
                {l.kind === 'add' ? '+ ' : l.kind === 'remove' ? '- ' : '  '}
                {l.text}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// Simple line-level diff (Myers-lite)
function computeLineDiff(a: string, b: string) {
  const aLines = a.split('\n')
  const bLines = b.split('\n')
  const out: { kind: 'same' | 'add' | 'remove'; text: string }[] = []
  let i = 0
  let j = 0
  while (i < aLines.length && j < bLines.length) {
    if (aLines[i] === bLines[j]) {
      out.push({ kind: 'same', text: aLines[i] })
      i++
      j++
    } else {
      // look ahead: is the b line further in a?
      const foundInA = aLines.indexOf(bLines[j], i)
      const foundInB = bLines.indexOf(aLines[i], j)
      if (foundInA !== -1 && (foundInB === -1 || foundInA - i < foundInB - j)) {
        while (i < foundInA) {
          out.push({ kind: 'remove', text: aLines[i++] })
        }
      } else if (foundInB !== -1) {
        while (j < foundInB) {
          out.push({ kind: 'add', text: bLines[j++] })
        }
      } else {
        out.push({ kind: 'remove', text: aLines[i++] })
        out.push({ kind: 'add', text: bLines[j++] })
      }
    }
  }
  while (i < aLines.length) out.push({ kind: 'remove', text: aLines[i++] })
  while (j < bLines.length) out.push({ kind: 'add', text: bLines[j++] })
  return out
}
