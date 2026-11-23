import { useCallback, useEffect, useState } from 'react'

/**
 * 요소의 화면 위 위치와 높이(px)를 잰다. 크기가 바뀌거나 창 크기가 바뀌면 다시 잰다.
 * 떠 있는 유리(요약 띠, 아래 시트)가 바닥판의 어디까지 덮는지 알아내는 데 쓴다.
 */
export function useElementBox<T extends HTMLElement>(): [
  (el: T | null) => void,
  { top: number; bottom: number; height: number } | null,
] {
  const [element, setElement] = useState<T | null>(null)
  const [box, setBox] = useState<{ top: number; bottom: number; height: number } | null>(null)
  const ref = useCallback((el: T | null) => setElement(el), [])

  useEffect(() => {
    if (!element) return
    const measure = () => {
      const rect = element.getBoundingClientRect()
      const height = element.offsetHeight
      if (height <= 0) return
      setBox((prev) =>
        prev?.top === rect.top && prev.bottom === rect.bottom && prev.height === height
          ? prev
          : { top: rect.top, bottom: rect.bottom, height },
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [element])

  return [ref, box]
}
