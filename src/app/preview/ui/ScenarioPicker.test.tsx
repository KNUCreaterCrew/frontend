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
    screen.getByText('모르는 시나리오예요: nope. 기본(mixed)으로 열었어요.'),
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
