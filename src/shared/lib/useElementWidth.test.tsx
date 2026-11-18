import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setObservedWidth } from '@/shared/test/resizeObserver'
import { useElementWidth } from './useElementWidth'

function Probe() {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  return (
    <div ref={ref} data-testid="box">
      {width === null ? 'none' : String(width)}
    </div>
  )
}

describe('useElementWidth', () => {
  it('기본 스텁 너비 328 을 돌려준다', () => {
    render(<Probe />)
    expect(screen.getByTestId('box')).toHaveTextContent('328')
  })

  it('관찰 값이 없으면 null', () => {
    setObservedWidth(null)
    render(<Probe />)
    expect(screen.getByTestId('box')).toHaveTextContent('none')
  })
})
