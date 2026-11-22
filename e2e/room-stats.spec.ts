import { expect, test, type Page } from '@playwright/test'

const url = (scenario: string) => `/rooms/IT4-101?scenario=${scenario}`
const panel = (page: Page) => page.getByRole('region', { name: '오늘 빈자리 흐름' })

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

for (const width of [360, 390]) {
  test(`mixed ${width}: 통계 판이 보이고 가로 넘침 없이 축 라벨이 판 안에 있다`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto(url('mixed'))
    const stats = panel(page)
    await expect(stats).toBeVisible()
    expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
    const plate = await stats.boundingBox()
    for (const label of ['0석', '9시']) {
      const text = stats.getByText(label, { exact: true }).first()
      await expect(text).toBeVisible()
      const box = await text.boundingBox()
      expect(box, label).not.toBeNull()
      expect(box!.x, `${label} left`).toBeGreaterThanOrEqual(plate!.x)
      expect(box!.x + box!.width, `${label} right`).toBeLessThanOrEqual(plate!.x + plate!.width)
      expect(box!.y, `${label} top`).toBeGreaterThanOrEqual(plate!.y)
      expect(box!.y + box!.height, `${label} bottom`).toBeLessThanOrEqual(plate!.y + plate!.height)
    }
  })

  test(`mixed ${width}: 요일 버튼은 높이 44px 이상, 폭 40px 이상이다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto(url('mixed'))
    const group = panel(page).getByRole('group', { name: '요일' })
    await expect(group).toBeVisible()
    const buttons = group.getByRole('button')
    await expect(buttons).toHaveCount(7)
    for (let i = 0; i < 7; i++) {
      const box = await buttons.nth(i).boundingBox()
      expect(box!.width, `button ${i} width`).toBeGreaterThanOrEqual(40)
      expect(box!.height, `button ${i} height`).toBeGreaterThanOrEqual(44)
    }
  })
}

test('stats-seed: 평소 값이 예시 데이터라는 문구가 보인다', async ({ page }) => {
  await page.goto(url('stats-seed'))
  await expect(page.getByText('평소 값은 최근 4주 예시 데이터예요.').first()).toBeVisible()
})

test('mixed 390: 토요일을 누르면 문장이 바뀌고 눌린 상태가 된다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto(url('mixed'))
  const saturday = panel(page).getByRole('button', { name: '토요일' })
  await saturday.click()
  await expect(saturday).toHaveAttribute('aria-pressed', 'true')
  await expect(panel(page).getByText('토요일은 시간대별 차이가 크지 않아요.')).toBeVisible()
})

test('mixed 1280: 통계 판은 왼쪽 열에서 네이비 패널과 같은 x 이고 좌석도보다 왼쪽이다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(url('mixed'))
  const stats = panel(page)
  await expect(stats).toBeVisible()
  const navy = page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::section[1]')
  const statsBox = await stats.boundingBox()
  const navyBox = await navy.boundingBox()
  expect(statsBox!.x).toBeCloseTo(navyBox!.x, 0)
  const seat = await page.getByRole('button', { name: /^A1 / }).boundingBox()
  expect(statsBox!.x + statsBox!.width).toBeLessThanOrEqual(seat!.x)
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
})
