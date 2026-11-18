import { useEffect, useRef, useState } from 'react'

interface Options {
  delayMs?: number
  minVisibleMs?: number
}

export function useDelayedVisibility(
  active: boolean,
  { delayMs = 200, minVisibleMs = 400 }: Options = {},
): boolean {
  const [visible, setVisible] = useState(false)
  const visibleRef = useRef(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (active) {
      if (visibleRef.current) return
      const id = setTimeout(() => {
        shownAt.current = Date.now()
        visibleRef.current = true
        setVisible(true)
      }, delayMs)
      return () => clearTimeout(id)
    }
    if (!visibleRef.current) return
    const remaining = Math.max(0, minVisibleMs - (Date.now() - shownAt.current))
    const id = setTimeout(() => {
      visibleRef.current = false
      setVisible(false)
    }, remaining)
    return () => clearTimeout(id)
  }, [active, delayMs, minVisibleMs])

  return visible
}
