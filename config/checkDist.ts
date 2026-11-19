import fs from 'node:fs'
import path from 'node:path'

type DistFile = { path: string; content: string }

const WORKER = 'mockServiceWorker.js'
const MARKERS = ['mockServiceWorker', '__preview']
const BACKEND = 'zeroframe-backend'

/** 결과물에서 모의 데이터가 들어간 흔적을 찾아 설명 목록으로 돌려준다. JS 파일 내용만 본다. */
export function findMswTraces(files: DistFile[]): string[] {
  const traces: string[] = []
  for (const file of files) {
    if (path.basename(file.path) === WORKER) traces.push(`${file.path} 파일이 있습니다`)
    if (!file.path.endsWith('.js')) continue
    for (const word of MARKERS) {
      if (file.content.includes(word)) traces.push(`${file.path} 에 ${word} 가 들어 있습니다`)
    }
  }
  return traces
}

function readDir(dir: string, base = dir): DistFile[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return readDir(full, base)
    const rel = path.relative(base, full).split(path.sep).join('/')
    return [{ path: rel, content: rel.endsWith('.js') ? fs.readFileSync(full, 'utf8') : '' }]
  })
}

/** expect=false 는 운영 결과물(흔적 없음), true 는 미리보기 결과물(워커와 표지 있음, 실제 백엔드 없음). */
export function checkDist(dir: string, expectMock: boolean): { ok: boolean; message: string } {
  const files = readDir(dir)
  if (!expectMock) {
    const traces = findMswTraces(files)
    return traces.length
      ? { ok: false, message: `모의 데이터 흔적이 있습니다: ${traces.join(', ')}` }
      : { ok: true, message: `${dir}: 모의 데이터 흔적 없음` }
  }

  const js = files.filter((f) => f.path.endsWith('.js') && path.basename(f.path) !== WORKER)
  const missing: string[] = []
  if (!files.some((f) => f.path === WORKER)) missing.push(`${WORKER} 파일`)
  for (const word of MARKERS) {
    if (!js.some((f) => f.content.includes(word))) missing.push(`JS 의 ${word} 표지`)
  }
  const problems: string[] = []
  if (missing.length) problems.push(`빠진 것: ${missing.join(', ')}`)
  const leaked = js.filter((f) => f.content.includes(BACKEND)).map((f) => f.path)
  if (leaked.length)
    problems.push(`실제 백엔드 주소(${BACKEND})가 들어 있습니다: ${leaked.join(', ')}`)
  return problems.length
    ? { ok: false, message: problems.join('; ') }
    : { ok: true, message: `${dir}: 워커와 표지가 있고 실제 백엔드 주소 없음` }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const dir = process.argv[2]
  if (!dir) {
    console.error('사용법: node config/checkDist.ts <dir> [--expect]')
    process.exit(2)
  }
  const result = checkDist(dir, process.argv.includes('--expect'))
  if (result.ok) console.log(result.message)
  else console.error(result.message)
  process.exit(result.ok ? 0 : 1)
}
