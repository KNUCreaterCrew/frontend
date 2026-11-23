import { expect, test, type Locator, type Page } from '@playwright/test'

// 휴대폰 방 화면의 조작층: 위 요약 띠, 화면 가득한 바닥판, 아래 끌어 올리는 유리 시트
const url = (scenario: string) => `/rooms/IT4-101?scenario=${scenario}`
const summaryOf = (page: Page) =>
  page.getByRole('heading', { level: 1 }).locator('xpath=ancestor::section[1]')
const sheetOf = (page: Page) => page.locator('[data-room-sheet]')
const expandButton = (page: Page) => page.getByRole('button', { name: '빈자리 흐름 펼치기' })
const collapseButton = (page: Page) => page.getByRole('button', { name: '빈자리 흐름 접기' })
const weekdays = (page: Page) => page.getByRole('group', { name: '요일' })

async function box(target: Locator) {
  const b = await target.boundingBox()
  expect(b).not.toBeNull()
  return b!
}

// 움직임이 끝나 높이가 멈출 때까지 기다린다
async function settled(target: Locator) {
  let previous = -1
  await expect
    .poll(
      async () => {
        const h = (await target.boundingBox())?.height ?? -1
        const same = h > 0 && h === previous
        previous = h
        return same
      },
      { intervals: [120], timeout: 5_000 },
    )
    .toBe(true)
}

test('mixed: 좌석은 위 요약 띠와 아래 접힌 시트 사이에 있고 둘에 가려지지 않는다', async ({
  page,
}) => {
  await page.goto(url('mixed'))
  await expect(expandButton(page)).toBeVisible()
  await settled(sheetOf(page))
  const summary = await box(summaryOf(page))
  const sheet = await box(sheetOf(page))
  for (const label of ['A1', 'A2', 'B1', 'B2']) {
    const seat = await box(page.getByRole('button', { name: new RegExp(`^${label} `) }))
    expect(seat.y, `${label} top`).toBeGreaterThanOrEqual(summary.y + summary.height)
    expect(seat.y + seat.height, `${label} bottom`).toBeLessThanOrEqual(sheet.y)
  }
  // 접힌 시트는 화면 아래에 떠 있고, 요일 고르기는 시트 아래로 잘려 보이지 않는다
  const viewport = page.viewportSize()!
  expect(sheet.y + sheet.height).toBeLessThan(viewport.height)
  expect((await box(weekdays(page))).y).toBeGreaterThanOrEqual(sheet.y + sheet.height)
})

test('mixed: 손잡이를 누르면 펼쳐져 요일 고르기가 보이고, 다시 누르면 접힌다', async ({ page }) => {
  await page.goto(url('mixed'))
  await expandButton(page).click()
  await expect(collapseButton(page)).toHaveAttribute('aria-expanded', 'true')
  await settled(sheetOf(page))
  const sheet = await box(sheetOf(page))
  await weekdays(page).scrollIntoViewIfNeeded()
  const group = await box(weekdays(page))
  expect(group.y).toBeGreaterThanOrEqual(sheet.y - 0.5)
  expect(group.y + group.height).toBeLessThanOrEqual(sheet.y + sheet.height + 0.5)
  // 펼친 시트는 요약 띠 아래에서 멈춰 큰 빈자리 숫자를 가리지 않는다
  const summary = await box(summaryOf(page))
  expect(sheet.y).toBeGreaterThanOrEqual(summary.y + summary.height)
  await collapseButton(page).click()
  await expect(expandButton(page)).toHaveAttribute('aria-expanded', 'false')
})

test('mixed: 손잡이를 위로 끌어 놓으면 펼쳐진다', async ({ page }) => {
  await page.goto(url('mixed'))
  const handle = expandButton(page)
  await expect(handle).toBeVisible()
  await settled(sheetOf(page))
  const before = await box(sheetOf(page))
  const h = await box(handle)
  const from = { x: h.x + h.width / 2, y: h.y + h.height / 2 }
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let i = 1; i <= 10; i++) await page.mouse.move(from.x, from.y - 30 * i)
  await page.mouse.up()
  await expect(collapseButton(page)).toBeVisible()
  await settled(sheetOf(page))
  expect((await box(sheetOf(page))).height).toBeGreaterThan(before.height + 100)
})

test('mixed: 접힌 동안 키보드로 시트 아래 내용에 가면 시트가 펼쳐진다', async ({ page }) => {
  await page.goto(url('mixed'))
  await expect(expandButton(page)).toBeVisible()
  await page.getByRole('button', { name: '토요일' }).focus()
  await expect(collapseButton(page)).toBeVisible()
})
