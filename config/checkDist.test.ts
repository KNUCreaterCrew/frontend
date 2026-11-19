// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { checkDist, findMswTraces } from './checkDist'

test('mockServiceWorker.js 파일 자체가 흔적', () => {
  expect(findMswTraces([{ path: 'mockServiceWorker.js', content: '' }]).length).toBeGreaterThan(0)
})

test.each(['mockServiceWorker', '__preview'])('JS 내용의 %s 는 흔적', (word) => {
  const traces = findMswTraces([{ path: 'assets/index-abc.js', content: `x("${word}")` }])
  expect(traces).toHaveLength(1)
  expect(traces[0]).toContain(word)
})

test('css 와 html 내용은 보지 않는다', () => {
  expect(
    findMswTraces([
      { path: 'assets/a.css', content: '/* __preview mockServiceWorker */' },
      { path: 'index.html', content: '<!-- __preview mockServiceWorker -->' },
    ]),
  ).toEqual([])
})

test('흔적이 없으면 빈 목록', () => {
  expect(findMswTraces([{ path: 'assets/index.js', content: 'console.log(1)' }])).toEqual([])
})

function makeDir(files: Record<string, string>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-dist-'))
  for (const [p, content] of Object.entries(files)) {
    const full = path.join(dir, p)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content)
  }
  return dir
}

describe('checkDist(dir, false)', () => {
  test('흔적이 없으면 ok', () => {
    const dir = makeDir({ 'index.html': '<html></html>', 'assets/a.js': 'let a = 1' })
    expect(checkDist(dir, false).ok).toBe(true)
  })
  test('흔적이 있으면 실패하고 이름을 알려 준다', () => {
    const dir = makeDir({ 'assets/a.js': 'window.__preview = 1' })
    const r = checkDist(dir, false)
    expect(r.ok).toBe(false)
    expect(r.message).toContain('__preview')
  })
})

describe('checkDist(dir, true)', () => {
  const full = {
    'mockServiceWorker.js': 'worker',
    'assets/a.js': 'start("mockServiceWorker"); window.__preview = 1',
  }
  test('워커와 두 표지가 모두 있으면 ok', () => {
    expect(checkDist(makeDir(full), true).ok).toBe(true)
  })
  test('워커 파일이 없으면 실패', () => {
    const r = checkDist(makeDir({ 'assets/a.js': full['assets/a.js'] }), true)
    expect(r.ok).toBe(false)
    expect(r.message).toContain('mockServiceWorker.js')
  })
  test('__preview 표지가 없으면 실패', () => {
    const r = checkDist(
      makeDir({ 'mockServiceWorker.js': 'w', 'assets/a.js': 'start("mockServiceWorker")' }),
      true,
    )
    expect(r.ok).toBe(false)
    expect(r.message).toContain('__preview')
  })
  test('JS 의 mockServiceWorker 표지가 없으면 실패', () => {
    const r = checkDist(
      makeDir({ 'mockServiceWorker.js': 'w', 'assets/a.js': 'window.__preview = 1' }),
      true,
    )
    expect(r.ok).toBe(false)
    expect(r.message).toContain('mockServiceWorker')
  })
  test('JS 에 실제 백엔드 주소가 있으면 실패', () => {
    const r = checkDist(
      makeDir({
        ...full,
        'assets/b.js': 'fetch("https://zeroframe-backend-p1wa.onrender.com")',
      }),
      true,
    )
    expect(r.ok).toBe(false)
    expect(r.message).toContain('zeroframe-backend')
  })
})
