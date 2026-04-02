'use client'

import { useState, useRef, type ReactNode } from 'react'

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={ref}
    >
      {children}
      {visible && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap"
          style={{
            background: '#0f1117',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            animation: 'fade-up 0.15s ease-out forwards',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
