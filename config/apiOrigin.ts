const EXAMPLE = 'https://zeroframe-backend-p1wa.onrender.com'

type Input = { command: 'build' | 'serve'; mode: string; value: string | undefined }

function fail(reason: string): never {
  throw new Error(
    `VITE_API_ORIGIN ${reason}. 운영 빌드는 백엔드 출처가 필요합니다. ` +
      `경로, 쿼리, 해시 없이 http(s) 출처만 적습니다(예: ${EXAMPLE}). .env.production 을 확인하세요.`,
  )
}

/** 운영 빌드에서만 백엔드 출처를 검증하고, 끝 / 를 뗀 값을 돌려준다. 그 밖에는 undefined. */
export function checkApiOrigin({ command, mode, value }: Input): string | undefined {
  if (command !== 'build' || mode !== 'production') return undefined
  if (!value) fail('값이 비어 있습니다')

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return fail(`값 "${value}" 은 주소로 읽을 수 없습니다`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    fail(`값 "${value}" 의 프로토콜이 http 나 https 가 아닙니다`)
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    fail(`값 "${value}" 에 경로, 쿼리 또는 해시가 있습니다`)
  }
  return url.origin
}
