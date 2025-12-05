import { useCallback, useMemo } from 'react'
import type React from 'react'

export function useHorizontalScroll(ref: React.RefObject<HTMLElement | null>, step = 480) {
  const prefersReduced = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const scrollBy = useCallback(
    (delta: number) => {
      const el = ref.current
      if (!el) return
      try {
        el.scrollBy({ left: delta, behavior: prefersReduced ? 'auto' : 'smooth' })
      } catch {
        // fallback for older browsers
        el.scrollLeft += delta
      }
    },
    [prefersReduced, ref],
  )

  const scrollLeft = useCallback(() => scrollBy(-Math.abs(step)), [scrollBy, step])
  const scrollRight = useCallback(() => scrollBy(Math.abs(step)), [scrollBy, step])

  return { scrollLeft, scrollRight }
}

export default useHorizontalScroll
