import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '@mocks/node'
import { installResizeObserverStub, resetObservedWidth } from './resizeObserver'

installResizeObserverStub()

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetObservedWidth()
})
afterAll(() => server.close())
