import { render, screen } from '@testing-library/react'
import { LoadingStatus } from './LoadingStatus'

describe('LoadingStatus', () => {
  test('처음에는 빈 안내', () => {
    render(<LoadingStatus elapsedMs={0} />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
  test('5초 넘으면 깨우는 중', () => {
    render(<LoadingStatus elapsedMs={5000} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      '서버를 깨우는 중이에요. 처음 열면 1분쯤 걸릴 수 있어요.',
    )
  })
  test('60초 넘으면 오래 걸림', () => {
    render(<LoadingStatus elapsedMs={60000} />)
    expect(screen.getByRole('status')).toHaveTextContent(
      '생각보다 오래 걸려요. 조금만 더 기다려 주세요.',
    )
  })
  test('paused 면 오프라인 안내가 우선', () => {
    render(<LoadingStatus elapsedMs={60000} paused />)
    expect(screen.getByRole('status')).toHaveTextContent(
      '인터넷에 연결되어 있지 않아요. 연결되면 바로 불러올게요.',
    )
  })
})
