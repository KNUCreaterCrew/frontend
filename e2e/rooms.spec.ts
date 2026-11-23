import { expect, test, type Page } from '@playwright/test'

const url = (scenario: string) => `/?scenario=${scenario}`
const H1 = '방을 골라 주세요'

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
  await expect(page.getByText('방 목록을 불러오지 못했어요.')).toBeVisible()
  await expect(page.getByRole('button', { name: '다시 시도' })).toBeVisible()
  expect(await pageOverflow(page)).toBeLessThanOrEqual(0)
  // 4xx/5xx 응답은 브라우저가 스스로 "Failed to load resource" 로 콘솔에 남기므로 이 줄만 제외한다.
  expect(errors.filter((e) => !e.includes('Failed to load resource'))).toEqual([])
})

test('mixed: 행을 누르면 방으로 가고 방 목록 링크로 돌아온다', async ({ page }) => {
  await page.goto(url('mixed'))
  await page.getByRole('link', { name: /^제1실습실/ }).click()
  await expect(page).toHaveURL(/\/rooms\/IT4-101/)
  await expect(page.getByRole('heading', { level: 1, name: '제1실습실 (예시)' })).toBeVisible()
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

test('rooms-many: 타일이 2열이고 같은 열의 이름과 표가 같은 x, 확인 불가 글자가 줄바꿈되지 않는다', async ({
  page,
}) => {
  await page.goto(url('rooms-many'))
  const rows = page.getByRole('listitem')
  await expect(rows).toHaveCount(6)
  const xs = await rows.evaluateAll((items) =>
    items.map((li) => {
      const name = li.querySelector('a > span > span')?.getBoundingClientRect()
      const table = li.querySelector('dl')?.getBoundingClientRect()
      return { name: name?.left ?? null, table: table?.left ?? null }
    }),
  )
  // 휴대폰은 2열: 이름이 시작하는 x 는 두 가지뿐이고, 표가 있는 타일은 그 열의 이름과 같은 x
  expect(new Set(xs.map((x) => x.name)).size).toBe(2)
  for (const x of xs) if (x.table !== null) expect(x.table).toBe(x.name)
  expect(xs.filter((x) => x.table !== null)).toHaveLength(5)
  const word = page
    .getByText('확인 불가', { exact: true })
    .and(page.locator('span.text-heading'))
    .first()
  const box = await word.boundingBox()
  expect(box!.height).toBeLessThan(40)
})

test('좌석 무대: 캡슐이 보이고 누르면 그 방으로 간다', async ({ page }) => {
  await page.goto(url('rooms-many'))
  const stage = page.getByRole('region', { name: '좌석 무대' })
  // WebGL 이 되면 캔버스, 안 되면 정지 그림. 어느 쪽이든 무대가 그려진다
  await expect(stage.locator('canvas, svg rect').first()).toBeVisible()
  const caption = stage.getByRole('link', {
    name: '지금 빈자리가 가장 많은 방, 제1실습실 (예시), 빈자리 3석',
  })
  await expect(caption).toBeInViewport()
  await caption.click()
  await expect(page).toHaveURL(/\/rooms\/IT4-101/)
})

test('좌석 무대: 동작 줄이기면 three.js 없이 정지 그림', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url('mixed'))
  const stage = page.getByRole('region', { name: '좌석 무대' })
  await expect(stage.locator('svg rect')).toHaveCount(4)
  await expect(stage.locator('canvas')).toHaveCount(0)
})

test('첫 화면에 좌석 무대 캡슐과 첫 타일의 빈자리 숫자가 함께 보인다', async ({ page }) => {
  await page.goto(url('rooms-many'))
  await expect(page.getByRole('region', { name: '좌석 무대' }).getByRole('link')).toBeInViewport()
  const first = page.getByRole('listitem').first()
  await expect(first.getByText('3', { exact: true })).toBeInViewport()
})
