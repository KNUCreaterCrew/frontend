import { useEffect, useState } from 'react'

export function useElapsed(active: boolean, restartKey: number): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!active) return
    const start = Date.now()
    const id = setInterval(() => setElapsed(Date.now() - start), 1000)
    return () => {
      clearInterval(id)
      setElapsed(0)
    }
  }, [active, restartKey])

  return active ? elapsed : 0
}
