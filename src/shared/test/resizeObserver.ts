const DEFAULT_WIDTH = 328

let observedWidth: number | null = DEFAULT_WIDTH

export function setObservedWidth(px: number | null): void {
  observedWidth = px
}

export function resetObservedWidth(): void {
  observedWidth = DEFAULT_WIDTH
}

class ResizeObserverStub {
  private readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(el: Element): void {
    if (observedWidth === null) return
    const entry = { target: el, contentRect: { width: observedWidth } }
    this.callback([entry as ResizeObserverEntry], this)
  }

  unobserve(): void {}

  disconnect(): void {}
}

export function installResizeObserverStub(): void {
  globalThis.ResizeObserver = ResizeObserverStub
}
