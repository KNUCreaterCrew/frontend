import { server } from './node'
import { commonLinks, scenarioGroups, scenarioGuide } from './scenarioGuide'
import { resolveScenario, scenarios } from './scenarios'

const roomIdOf = (path: string) => path.split('/rooms/')[1]!

test('모든 안내 키가 시나리오로 있다', () => {
  for (const name of Object.keys(scenarioGuide)) expect(Object.keys(scenarios)).toContain(name)
})
test('모든 시나리오에 안내가 있다', () => {
  expect(Object.keys(scenarioGuide).sort()).toEqual(Object.keys(scenarios).sort())
})
test('모든 묶음이 정의된 묶음이다', () => {
  const ids = scenarioGroups.map((g) => g.id)
  for (const entry of Object.values(scenarioGuide)) expect(ids).toContain(entry.group)
})

const seatLinks = Object.entries(scenarioGuide).flatMap(([name, entry]) =>
  entry.links.flatMap((link) => (link.seat ? [{ name, link }] : [])),
)

test('좌석 링크가 있다', () => {
  expect(seatLinks.length).toBeGreaterThan(0)
})
test.each(seatLinks.map(({ name, link }) => [name, link.seat!, link.path] as const))(
  '%s 의 %s 좌석은 응답에 있다',
  async (name, seat, path) => {
    server.resetHandlers()
    server.use(...resolveScenario(name))
    const res = await fetch('http://localhost/api/v1/rooms/' + roomIdOf(path))
    const body = (await res.json()) as { seats: { seat_id: string }[] }
    expect(body.seats.map((s) => s.seat_id)).toContain(seat)
  },
)

test('rooms-many 의 방 링크는 열린다', async () => {
  server.use(...resolveScenario('rooms-many'))
  for (const link of scenarioGuide['rooms-many']!.links.filter((l) =>
    l.path.startsWith('/rooms/'),
  )) {
    const res = await fetch('http://localhost/api/v1/rooms/' + roomIdOf(link.path))
    expect(res.status, link.path).toBe(200)
  }
  const ids = scenarioGuide['rooms-many']!.links.map((l) => l.path)
  expect(ids).toContain('/rooms/IT4-102')
  expect(ids).toContain('/rooms/IT4-106')
})
test('없는 방 링크는 404 다', async () => {
  const link = commonLinks.find((l) => l.path === '/rooms/NOPE')!
  server.use(...resolveScenario(link.scenario))
  const res = await fetch('http://localhost/api/v1/rooms/NOPE')
  expect(res.status).toBe(404)
})
