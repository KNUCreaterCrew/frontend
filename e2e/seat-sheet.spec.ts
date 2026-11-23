import { expect, test, type Locator, type Page } from '@playwright/test'

const url = (scenario: string) => `/rooms/IT4-101?scenario=${scenario}`
const seatButton = (page: Page, label: string) =>
  page.getByRole('button', { name: new RegExp(`^${label} `) })
const dialogOf = (page: Page) => page.getByRole('dialog')

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

const pageOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

async function openSeat(page: Page, scenario: string, label: string) {
  await page.goto(url(scenario))
  const seat = seatButton(page, label)
  await expect(seat).toBeVisible()
  await seat.click()
  await expect(dialogOf(page)).toBeVisible()
  return seat
}

// 열리는 움직임이 끝나 위치가 멈출 때까지 기다린다.
async function settled(target: Locator) {
  let previous = ''
  await expect
    .poll(
      async () => {
        const box = await target.boundingBox()
        const now = box ? `${box.x},${box.y},${box.width},${box.height}` : ''
        const same = now !== '' && now === previous
        previous = now
        return same
      },
      { intervals: [120], timeout: 5_000 },
    )
    .toBe(true)
}

async function center(target: Locator) {
  const box = await target.boundingBox()
  expect(box).not.toBeNull()
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }
}

async function dragDown(
  page: Page,
  from: { x: number; y: number },
  distance: number,
  steps: number,
  pauseMs: number,
) {
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x, from.y + (distance * i) / steps)
    if (pauseMs > 0) await page.waitForTimeout(pauseMs)
  }
  await page.mouse.up()
}

const handleOf = (page: Page) => dialogOf(page).locator('div[aria-hidden="true"].w-10')

test('mixed: A1 을 열면 시트가 화면 안에 있고 가로 넘침과 콘솔 오류가 없으며 닫기는 44px 이상이다', async ({
  page,
}) => {
  const errors = collectErrors(page)
  await openSeat(page, 'mixed', 'A1')
  const dialog = dialogOf(page)
  await settled(dialog)
  const vp = page.viewportSize()!
  const box = (await dialog.boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(-0.5)
  expect(box.y).toBeGreaterThanOrEqual(-0.5)
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 0.5)
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 0.5)
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
  const close = (await dialog.getByRole('button', { name: '닫기' }).boundingBox())!
  expect(close.height).toBeGreaterThanOrEqual(44)
  expect(errors).toEqual([])
})

test('mixed: 손잡이에서 아래로 200px 끌면 닫힌다', async ({ page }) => {
  await openSeat(page, 'mixed', 'A1')
  await settled(dialogOf(page))
  const from = await center(handleOf(page))
  await dragDown(page, from, 200, 10, 15)
  await expect(dialogOf(page)).toHaveCount(0)
  expect(page.url()).toContain('/rooms/IT4-101')
  expect(new URL(page.url()).searchParams.has('seat')).toBe(false)
})

test('mixed: 손잡이를 30px 천천히 끌었다 놓으면 열린 채 제자리로 돌아온다', async ({ page }) => {
  await openSeat(page, 'mixed', 'A1')
  const dialog = dialogOf(page)
  await settled(dialog)
  const before = (await dialog.boundingBox())!
  const handleBefore = (await handleOf(page).boundingBox())!
  const from = await center(handleOf(page))
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  for (let i = 1; i <= 30; i++) {
    await page.mouse.move(from.x, from.y + i)
    await page.waitForTimeout(40)
  }
  // 끄는 동안에는 시트가 실제로 손가락을 따라 내려온다
  const held = (await handleOf(page).boundingBox())!
  expect(held.y - handleBefore.y).toBeGreaterThan(15)
  await page.mouse.up()
  await expect(dialog).toBeVisible()
  await settled(handleOf(page))
  const after = (await dialog.boundingBox())!
  expect(Math.abs(after.y - before.y)).toBeLessThan(1)
  const handleAfter = (await handleOf(page).boundingBox())!
  expect(Math.abs(handleAfter.y - handleBefore.y)).toBeLessThan(1)
})

test('mixed: 내용 영역에서 아래로 끌어도 시트는 닫히지 않는다', async ({ page }) => {
  await openSeat(page, 'mixed', 'A1')
  const dialog = dialogOf(page)
  await settled(dialog)
  const before = (await handleOf(page).boundingBox())!
  const from = await center(dialog.locator('dl'))
  await dragDown(page, from, 200, 10, 15)
  await page.waitForTimeout(400)
  await expect(dialog).toBeVisible()
  const after = (await handleOf(page).boundingBox())!
  expect(Math.abs(after.y - before.y)).toBeLessThan(1)
})

test('mixed: 열고 뒤로 가면 시트가 닫히고 주소는 좌석 없이 돌아온다', async ({ page }) => {
  await openSeat(page, 'mixed', 'A1')
  expect(new URL(page.url()).searchParams.get('seat')).not.toBeNull()
  await page.goBack()
  await expect(dialogOf(page)).toHaveCount(0)
  expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(
    '/rooms/IT4-101?scenario=mixed',
  )
})

test('mixed: 키보드로 A1 에서 Enter 로 열고 Escape 로 닫으면 A1 에 포커스가 돌아온다', async ({
  page,
}) => {
  await page.goto(url('mixed'))
  const seat = seatButton(page, 'A1')
  await expect(seat).toBeVisible()
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    if (await seat.evaluate((el) => el === document.activeElement)) break
  }
  await expect(seat).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(dialogOf(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialogOf(page)).toHaveCount(0)
  await expect(seat).toBeFocused()
})

test('offline/mixed: 제목 옆 견본은 좌석 칸과 같은 상태(확인 불가는 점선, 빈자리는 에메랄드)다', async ({
  page,
}) => {
  await openSeat(page, 'offline', 'B2')
  const swatch = dialogOf(page).getByRole('heading').locator('[data-tone]')
  await expect(swatch).toHaveAttribute('data-tone', 'unknown')
  const box = (await swatch.boundingBox())!
  expect(box.width).toBeCloseTo(32, 0)
  expect(box.height).toBeCloseTo(24, 0)
  expect(await swatch.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('dashed')
  await page.keyboard.press('Escape')
  await expect(dialogOf(page)).toHaveCount(0)
  await openSeat(page, 'mixed', 'A1')
  await expect(swatch).toHaveAttribute('data-tone', 'empty')
})

test.describe('동작 줄이기', () => {
  test.use({ reducedMotion: 'reduce' })

  test('열린 시트와 막에는 움직임이 없다', async ({ page }) => {
    await openSeat(page, 'mixed', 'A1')
    await settled(dialogOf(page))
    const counts = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]')!
      const overlay = document.querySelector('.fixed.inset-0.z-30')!
      return {
        dialog: dialog.getAnimations({ subtree: true }).length,
        overlay: overlay.getAnimations({ subtree: true }).length,
      }
    })
    expect(counts).toEqual({ dialog: 0, overlay: 0 })
  })
})

test('live-demo: 강조된 좌석을 열면 그 좌석의 상태 글자가 15초 안에 바뀐다', async ({ page }) => {
  await page.goto(url('live-demo'))
  const ring = page.locator('span.outline-live').first()
  await expect(ring).toBeVisible({ timeout: 10_000 })
  const seatId = await ring.evaluate(
    (el) => (el.previousElementSibling as HTMLElement).dataset.seatId,
  )
  await page.locator(`button[data-seat-id="${seatId}"]`).click()
  const title = dialogOf(page).getByRole('heading')
  await expect(title).toBeVisible()
  const first = await title.innerText()
  await expect.poll(() => title.innerText(), { timeout: 15_000 }).not.toBe(first)
})

test('live-demo: 시트가 열려 있으면 다른 강조 테두리 자리도 시트나 막이 가린다', async ({
  page,
}) => {
  await page.goto(url('live-demo'))
  const rings = page.locator('span.outline-live')
  await expect(rings).toHaveCount(2, { timeout: 15_000 })
  const ids = await rings.evaluateAll((els) =>
    els.map((el) => (el.previousElementSibling as HTMLElement).dataset.seatId),
  )
  await page.locator(`button[data-seat-id="${ids[0]}"]`).click()
  await expect(dialogOf(page)).toBeVisible()
  const covered = await page.evaluate((seatId) => {
    const other = document.querySelector(`button[data-seat-id="${seatId}"]`)!
    const r = other.getBoundingClientRect()
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    const dialog = document.querySelector('[role="dialog"]')!
    const overlay = document.querySelector('.fixed.inset-0.z-30')!
    return !!hit && (dialog.contains(hit) || overlay.contains(hit))
  }, ids[1])
  expect(covered).toBe(true)
})

test('offline: A1 을 열면 장치 연결이 끊겼다는 이유가 보인다', async ({ page }) => {
  await openSeat(page, 'offline', 'A1')
  await expect(dialogOf(page).getByText('장치 연결이 끊겨 지금은 확인할 수 없어요')).toBeVisible()
})

test('seat-details: 이유별 문구와 값이 없을 때의 문구가 정확히 보인다', async ({ page }) => {
  await page.goto(url('seat-details'))
  const cases: Array<[string, string]> = [
    ['A1', '무언가에 가려 자리가 보이지 않아요'],
    ['A2', '비어 보이지만 아직 빈자리로 확인하지 못했어요'],
    ['A3', '판단이 엇갈려 확인하지 못했어요'],
    ['A4', '확인하는 데 시간이 오래 걸려 아직 몰라요'],
    ['A5', '한동안 새로 확인하지 못했어요'],
    ['A6', '장치 연결이 끊겨 지금은 확인할 수 없어요'],
    ['B1', '이유 정보가 없어요'],
    ['B2', '이유를 알 수 없어요'],
    ['B1', '아직 확인하지 못함'],
  ]
  for (const [label, text] of cases) {
    const seat = seatButton(page, label)
    await seat.click()
    await expect(dialogOf(page).getByText(text, { exact: true }), `${label}: ${text}`).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialogOf(page)).toHaveCount(0)
    await expect(seat).toBeFocused()
  }
})

test('many-seats: 확대 후 오른쪽 끝 좌석을 열고 Escape 로 닫으면 그 버튼이 포커스이고 화면 안에 보인다', async ({
  page,
}) => {
  await page.goto(url('many-seats'))
  await expect(seatButton(page, 'A1')).toBeVisible()
  await page.getByRole('button', { name: '확대' }).click()
  const seatId = await page.evaluate(() => {
    let best: { id: string; right: number } | null = null
    for (const el of document.querySelectorAll<HTMLElement>('button[data-seat-id]')) {
      const right = el.getBoundingClientRect().right
      if (!best || right > best.right) best = { id: el.dataset.seatId!, right }
    }
    return best!.id
  })
  const seat = page.locator(`button[data-seat-id="${seatId}"]`)
  await seat.click()
  await expect(dialogOf(page)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialogOf(page)).toHaveCount(0)
  await expect(seat).toBeFocused()
  const box = (await seat.boundingBox())!
  const vp = page.viewportSize()!
  expect(box.x).toBeGreaterThanOrEqual(-0.5)
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 0.5)
})

test.describe('넓은 화면', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('768px 에서 시트는 480px 이하이고 가운데에 있다', async ({ page }) => {
    await openSeat(page, 'mixed', 'A1')
    const dialog = dialogOf(page)
    await settled(dialog)
    const box = (await dialog.boundingBox())!
    expect(box.width).toBeLessThanOrEqual(480.5)
    expect(Math.abs(box.x + box.width / 2 - 384)).toBeLessThanOrEqual(1)
  })

  test.describe('동작 줄이기', () => {
    test.use({ reducedMotion: 'reduce' })
    test('막을 눌러 닫으면 그 아래 좌석의 시트가 따라 열리지 않는다', async ({ page }) => {
      await openSeat(page, 'mixed', 'A1')
      await settled(dialogOf(page))
      // 시트 밖(왼쪽)에 있어 막만 덮고 있는 다른 좌석을 찾는다
      const target = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]')!.getBoundingClientRect()
        for (const el of document.querySelectorAll<HTMLElement>('button[data-seat-id]')) {
          const r = el.getBoundingClientRect()
          const x = r.left + r.width / 2
          const y = r.top + r.height / 2
          if (y < dialog.top && y > 0 && x > 0 && x < window.innerWidth)
            return { x, y, id: el.dataset.seatId }
          if ((x < dialog.left || x > dialog.right) && y > 0 && y < window.innerHeight)
            return { x, y, id: el.dataset.seatId }
        }
        return null
      })
      expect(target).not.toBeNull()
      await page.mouse.click(target!.x, target!.y)
      await page.waitForTimeout(600)
      await expect(dialogOf(page)).toHaveCount(0)
      expect(new URL(page.url()).searchParams.has('seat')).toBe(false)
    })
  })
})
