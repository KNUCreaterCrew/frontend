import type { ProxyOptions } from 'vite'

export const DEFAULT_BACKEND_ORIGIN = 'http://127.0.0.1:8000'

export function createProxy(
  backendOrigin: string = DEFAULT_BACKEND_ORIGIN,
): Record<string, ProxyOptions> {
  const url = new URL(backendOrigin)
  const http = url.origin
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  const ws = url.origin
  return {
    '/api': { target: http, changeOrigin: true },
    '/ws': { target: ws, ws: true, changeOrigin: true },
  }
}
