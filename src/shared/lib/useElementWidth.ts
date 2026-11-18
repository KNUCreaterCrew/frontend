import { useCallback, useEffect, useState } from 'react'

export function useElementWidth<T extends Element>(): [(el: T | null) => void, number | null] {
  const [element, setElement] = useState<T | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const ref = useCallback((el: T | null) => setElement(el), [])

  useEffect(() => {
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      const w = entry.contentRect.width
      setWidth(w > 0 ? w : null)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  return [ref, width]
}
