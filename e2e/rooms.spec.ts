import { expect, test, type Page } from '@playwright/test'

const url = (scenario: string) => `/?scenario=${scenario}`
const H1 = '어느 방으로 갈까요'

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

const heading = (page: Page) => page.getByRole('heading', { level: 1, name: H1 })

const waitFor: Record<string, (page: Page) => Promise<void>> = {
  mixed: (p) => expect(p.getByRole('link', { name: /^제1실습실/ })).toBeVisible(),
  offline: (p) => expect(p.getByRole('link', { name: /^제1실습실/ })).toBeVisible(),
  'rooms-many': (p) => expect(p.getByRole('listitem')).toHaveCount(6),
  'rooms-empty': (p) => expect(p.getByText('아직 등록된 방이 없어요.')).toBeVisible(),
}

for (const scenario of Object.keys(waitFor)) {
  test(`${scenario}: 가로 넘침과 콘솔 오류가 없다`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(url(scenario))
    await expect(heading(page)).toBeVisible()
    await waitFor[scenario]!(page)
    expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })
}

test('error: 오류 문구와 다시 시도 버튼이 보인다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto(url('error'))
  // 앱이 재시도한 뒤에 오류 화면이 나오므로 넉넉히 기다린다
  await expect(page.getByText('방 목록을 불러오지 못했어요.')).toBeVisible({ timeout: 60_000 })
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible()
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
  // 4xx/5xx 응답은 브라우저가 스스로 "Failed to load resource" 로 콘솔에 남기므로 이 줄만 제외한다.
  expect(errors.filter((e) => !e.includes('Failed to load resource'))).toEqual([])
})

test('mixed: 행을 누르면 방으로 가고 방 목록 링크로 돌아온다', async ({ page }) => {
  await page.goto(url('mixed'))
  await page.getByRole('link', { name: /^제1실습실/ }).click()
  await expect(page).toHaveURL(/\/rooms\/IT4-101/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('link', { name: '방 목록' }).click()
  await expect(page).toHaveURL(/\/(\?.*)?$/)
  await expect(heading(page)).toBeVisible()
})

test('rooms-many: 6행이고 긴 이름 행도 화면 폭 안에 있다', async ({ page }) => {
  await page.goto(url('rooms-many'))
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(6)
  const width = page.viewportSize()!.width
  for (let i = 0; i < 6; i++) {
    const box = await rows.nth(i).boundingBox()
    expect(box, `row ${i}`).not.toBeNull()
    expect(box!.x, `row ${i} left`).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width, `row ${i} right`).toBeLessThanOrEqual(width)
  }
  const links = page.getByRole('link')
  const count = await links.count()
  for (let i = 0; i < count; i++) {
    const box = await links.nth(i).boundingBox()
    expect(box!.x + box!.width, `link ${i} right`).toBeLessThanOrEqual(width)
  }
})
