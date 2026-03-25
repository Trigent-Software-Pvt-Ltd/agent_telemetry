'use client'

import { useState, useEffect } from 'react'

export function useCountUp(target: number, duration = 600, decimals = 0): string {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let frameId: number

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)
      if (progress < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [target, duration])

  return current.toFixed(decimals)
}
