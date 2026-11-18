export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'parse'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(
    kind: ApiErrorKind,
    options: { status?: number; message?: string; cause?: unknown } = {},
  ) {
    super(options.message ?? kind, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    if (options.status !== undefined) this.status = options.status
  }
}

export function isNotFoundError(e: unknown): boolean {
  return e instanceof ApiError && e.kind === 'http' && e.status === 404
}
