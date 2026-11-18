import { expect, test, type Page } from '@playwright/test'

const url = (scenario: string) => `/rooms/IT4-101?scenario=${scenario}`

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

const waitFor: Record<string, (page: Page) => Promise<void>> = {
  mixed: (p) => expect(p.getByRole('button', { name: /^A1 / })).toBeVisible(),
  'all-unknown': (p) => expect(p.getByRole('button', { name: /^A1 / })).toBeVisible(),
  offline: (p) => expect(p.getByRole('button', { name: /^A1 / })).toBeVisible(),
  'many-seats': (p) => expect(p.getByRole('button', { name: /^A1 / })).toBeVisible(),
  'no-seats': (p) => expect(p.getByRole('heading', { level: 1 })).toBeVisible(),
  'not-found': (p) =>
    expect(p.getByRole('heading', { name: '이 방을 찾을 수 없어요' })).toBeVisible(),
  error: (p) =>
    expect(p.getByRole('heading', { name: '방 정보를 불러오지 못했어요' })).toBeVisible(),
}

for (const scenario of Object.keys(waitFor)) {
  test(`${scenario}: 가로 넘침과 콘솔 오류가 없다`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(url(scenario))
    await waitFor[scenario]!(page)
    expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
    // 4xx/5xx 응답은 브라우저가 스스로 "Failed to load resource" 로 콘솔에 남기므로 이 줄만 제외한다.
    const own =
      scenario === 'error' || scenario === 'not-found'
        ? errors.filter((e) => !e.includes('Failed to load resource'))
        : errors
    expect(own).toEqual([])
  })
}

test('mixed: 좌석 버튼은 44px 이상이고 핵심 정보가 첫 화면 안에 있다', async ({ page }) => {
  await page.goto(url('mixed'))
  const seats = page.getByRole('button', { name: /^[A-Z]\d+ / })
  await expect(seats).toHaveCount(4)
  for (let i = 0; i < 4; i++) {
    const box = await seats.nth(i).boundingBox()
    expect(box, `seat ${i}`).not.toBeNull()
    expect(box!.width, `seat ${i} width`).toBeGreaterThanOrEqual(44)
    expect(box!.height, `seat ${i} height`).toBeGreaterThanOrEqual(44)
  }
  const viewportHeight = page.viewportSize()!.height
  const row = page.getByRole('term').filter({ hasText: /^확인 불가$/ })
  const rowBox = await row.boundingBox()
  expect(rowBox!.y + rowBox!.height).toBeLessThanOrEqual(viewportHeight)
  const bigNumber = page.locator('main p[aria-hidden="true"]').filter({ hasText: /^\d+$/ })
  await expect(bigNumber).toHaveText('1')
  const big = await bigNumber.boundingBox()
  expect(big!.y + big!.height).toBeLessThanOrEqual(viewportHeight)
})

test('many-seats: 확대해도 좌석도 상자 안에서만 가로 스크롤된다', async ({ page }) => {
  await page.goto(url('many-seats'))
  const seat = page.getByRole('button', { name: /^A1 / })
  await expect(seat).toBeVisible()
  await page.getByRole('button', { name: '확대' }).click()
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
  const scroller = seat.locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]')
  const dims = await scroller.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }))
  expect(dims.sw).toBeGreaterThan(dims.cw)
  const box = await seat.boundingBox()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(43.5)
  await expect(page.getByRole('button', { name: '전체 보기' })).toBeVisible()
})

for (const width of [360, 390]) {
  test(`live-demo ${width}: 4초 안에 방금 문구가 보이고 가로 넘침과 콘솔 오류가 없다`, async ({
    page,
  }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width, height: 800 })
    await page.goto(url('live-demo'))
    await expect(page.getByRole('button', { name: /^A1 / })).toBeVisible()
    await expect(page.locator('main button').getByText(/^방금/)).toBeVisible({ timeout: 4_000 })
    expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })
}

test('live-demo: 동작 줄이기 설정이면 강조 테두리가 움직이지 않는다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url('live-demo'))
  const ring = page.locator('span.border-live').first()
  await expect(ring).toBeVisible({ timeout: 4_000 })
  expect(await ring.evaluate((el) => el.getAnimations().length)).toBe(0)
})
