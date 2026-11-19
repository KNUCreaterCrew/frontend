import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { scenarios } from '@mocks/scenarios'
import { ScenarioPicker } from './ScenarioPicker'

function renderPicker(props: { scenario: string; unknownScenario: string | null }) {
  return render(
    <MemoryRouter initialEntries={['/__preview']}>
      <ScenarioPicker {...props} />
    </MemoryRouter>,
  )
}

test('제목이 있다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  expect(screen.getByRole('heading', { level: 1, name: '어떤 화면을 볼까요' })).toBeInTheDocument()
})

test.each(Object.keys(scenarios))('%s 행의 첫 링크가 그 시나리오로 연다', (name) => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  const matches = screen.getAllByText(name, { exact: true })
  expect(matches.length).toBeGreaterThanOrEqual(1)
  const row = matches[0]?.closest('li')
  expect(row).not.toBeNull()
  const first = within(row as HTMLElement).getAllByRole('link')[0]
  expect(first?.getAttribute('href')).toContain(`scenario=${name}`)
})

test('지금 시나리오 행에만 지금 보는 중이 있다', () => {
  renderPicker({ scenario: 'offline', unknownScenario: null })
  const marks = screen.getAllByText('지금 보는 중')
  expect(marks).toHaveLength(1)
  expect(marks[0]?.closest('li')).toHaveTextContent('offline')
})

test('모르는 시나리오면 안내를 보인다', () => {
  renderPicker({ scenario: 'default', unknownScenario: 'nope' })
  expect(
    screen.getByText('모르는 시나리오예요: nope. 기본 시나리오(default)로 열었어요.'),
  ).toBeInTheDocument()
})

test('모르는 시나리오가 없으면 안내가 없다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  expect(screen.queryByText(/모르는 시나리오예요/)).toBeNull()
})

test('공통 링크는 mixed 로 연다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  expect(screen.getByRole('link', { name: '없는 방' })).toHaveAttribute(
    'href',
    '/rooms/NOPE?scenario=mixed',
  )
})

test('가이드에 없는 시나리오가 없으면 그 밖의 시나리오 묶음이 없다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  expect(screen.queryByRole('heading', { name: '그 밖의 시나리오' })).toBeNull()
})

test('행마다 반복되는 링크는 시나리오 제목이 이름에 붙어 구분된다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  const row = screen.getByText('offline', { exact: true }).closest('li') as HTMLElement
  const links = within(row)
    .getAllByRole('link')
    .map((link) => link.textContent)
  expect(links).toEqual(['방 목록', '좌석도', 'A1 좌석'].map((t) => t + ', 장치 연결이 끊긴 방'))
  expect(within(row).getByRole('link', { name: '좌석도, 장치 연결이 끊긴 방' })).toBeInTheDocument()
})

test('좌석 링크의 보이는 글자는 앱 표기이고 주소의 seat 는 그대로다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  const row = screen.getByText('seat-details', { exact: true }).closest('li') as HTMLElement
  const link = within(row).getByRole('link', { name: /^B3 좌석/ })
  expect(link).toHaveAttribute('href', '/rooms/IT4-101?scenario=seat-details&seat=B-03')
})

test('소개와 설명에 곧은 큰따옴표가 없다', () => {
  const { container } = renderPicker({ scenario: 'mixed', unknownScenario: null })
  expect(container.textContent).not.toContain('"')
  expect(
    screen.getByText('실제 장치와 서버 없이 모의 데이터로 앱을 볼 수 있어요.', { exact: false }),
  ).toBeInTheDocument()
})

test('지금 시나리오 행만 6px 칸을 채운다', () => {
  renderPicker({ scenario: 'offline', unknownScenario: null })
  const filled = document.querySelectorAll('li > span[aria-hidden="true"].bg-ink')
  expect(filled).toHaveLength(1)
  expect(filled[0]?.closest('li')).toHaveTextContent('offline')
})

test('묶음 제목은 text-fact 로 행 이름보다 강하다', () => {
  renderPicker({ scenario: 'mixed', unknownScenario: null })
  expect(screen.getByRole('heading', { level: 2, name: '좌석 상태' })).toHaveClass('text-fact')
})
