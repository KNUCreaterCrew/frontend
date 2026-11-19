import { expect, test, type Page } from '@playwright/test'
import { scenarioGuide } from '../mocks/scenarioGuide'

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

const band = (page: Page) => page.getByRole('complementary', { name: '미리보기 안내' })

test('시나리오 목록에 모든 시나리오가 보이고 가로로 넘치지 않는다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/__preview')
  await expect(page.getByRole('heading', { level: 1, name: '어떤 화면을 볼까요' })).toBeVisible()
  const names = Object.keys(scenarioGuide)
  expect(names).toHaveLength(19)
  for (const name of names) {
    await expect(page.getByText(name, { exact: true }).first(), name).toBeVisible()
  }
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
  expect(errors).toEqual([])
})

test('offline 행의 좌석도 링크로 열면 띠에 이름이 보인다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/__preview')
  const row = page.getByRole('listitem').filter({ hasText: 'offline' }).first()
  await row.getByRole('link', { name: '좌석도' }).click()
  await expect(band(page).getByText('offline', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '장치 연결이 끊겼어요' })).toBeVisible()
  expect(errors).toEqual([])
})

test('가장 긴 시나리오 이름도 띠가 화면 상단 줄을 가리지 않는다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/rooms/IT4-101?scenario=rooms-refresh-fail')
  const back = page.getByRole('link', { name: '방 목록' })
  await expect(back).toBeVisible()
  const bandBox = await band(page).boundingBox()
  const backBox = await back.boundingBox()
  expect(bandBox!.y + bandBox!.height).toBeLessThanOrEqual(backBox!.y)
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
  expect(errors).toEqual([])
})

test('좌석이 많은 방에서 포커스한 좌석이 띠에 가려지지 않는다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/rooms/IT4-101?scenario=many-seats')
  const seats = page.getByRole('button', { name: /^[A-Z]\d+ / })
  await expect(seats.first()).toBeVisible()
  const bandBottom = async () => {
    const b = await band(page).boundingBox()
    return b!.y + b!.height
  }
  await seats.last().focus()
  const lastBox = await seats.last().boundingBox()
  expect(lastBox!.y).toBeGreaterThanOrEqual(await bandBottom())

  await page.evaluate(() => window.scrollTo(0, 0))
  await seats.first().focus()
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    const box = await focused.boundingBox()
    expect(box, `tab ${i}`).not.toBeNull()
    expect(box!.y, `tab ${i}`).toBeGreaterThanOrEqual(await bandBottom())
  }
  expect(errors).toEqual([])
})

test('seat 쿼리로 좌석 상세 시트가 열린다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/rooms/IT4-101?scenario=seat-details&seat=B-03')
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(errors).toEqual([])
})

test('방 목록에서 방으로 이동하고 새로고침해도 시나리오가 유지된다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/?scenario=offline')
  await expect(band(page).getByText('offline', { exact: true })).toBeVisible()
  await page
    .getByRole('link', { name: /^제1실습실/ })
    .first()
    .click()
  await expect(page.getByRole('button', { name: /^A1 / })).toBeVisible()
  await page.reload()
  await expect(band(page).getByText('offline', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('모르는 시나리오는 기본으로 열고 목록 화면에서 알려 준다', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/?scenario=nope')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(band(page).getByText('default', { exact: true })).toBeVisible()

  await page.goto('/__preview?scenario=nope')
  await expect(page.getByText('모르는 시나리오예요: nope. 기본(mixed)으로 열었어요.')).toBeVisible()
  expect(errors).toEqual([])
})

test('서비스 워커가 등록된다', async ({ page }) => {
  await page.goto('/__preview')
  await expect(page.getByRole('heading', { level: 1, name: '어떤 화면을 볼까요' })).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => !!r)))
    .toBe(true)
})
