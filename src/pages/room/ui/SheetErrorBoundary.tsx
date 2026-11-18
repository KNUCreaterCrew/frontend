import { Component, type ReactNode } from 'react'

interface Props {
  onError: () => void
  children: ReactNode
}

// 시트 코드를 받지 못해 lazy 가 던져도 방 화면 전체가 사라지지 않게 여기서 멈춘다.
export class SheetErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
