export type GuideGroupId = 'seats' | 'rooms' | 'waiting' | 'live' | 'stats'
export type GuideLink = { label: string; path: string; seat?: string }
export type GuideEntry = {
  title: string
  description: string
  group: GuideGroupId
  links: GuideLink[]
}

export const scenarioGroups: readonly { id: GuideGroupId; title: string }[] = [
  { id: 'seats', title: '좌석 상태' },
  { id: 'rooms', title: '방 목록' },
  { id: 'waiting', title: '기다림과 오류' },
  { id: 'live', title: '실시간' },
  { id: 'stats', title: '혼잡도 통계' },
]

const ROOM = '/rooms/IT4-101'
const list: GuideLink = { label: '방 목록', path: '/' }
const room: GuideLink = { label: '좌석도', path: ROOM }
// 보이는 글자는 앱 표기(A1)이고 주소의 seat 는 계약의 좌석 ID(A-01)다.
const seat = (id: string): GuideLink => ({
  label: `${id.replace('-0', '')} 좌석`,
  path: ROOM,
  seat: id,
})

export const scenarioGuide: Record<string, GuideEntry> = {
  mixed: {
    title: '빈자리가 섞인 방',
    description: '빈자리, 사용 중, 짐 있음, 확인 불가가 섞인 기본 방이에요.',
    group: 'seats',
    links: [list, room, seat('A-01')],
  },
  'all-unknown': {
    title: '자리를 하나도 확인하지 못한 방',
    description: '모든 좌석이 확인 불가예요. 빈자리 숫자 대신 “모름”이 보여요.',
    group: 'seats',
    links: [list, room, seat('A-01')],
  },
  offline: {
    title: '장치 연결이 끊긴 방',
    description:
      '카메라 장치가 끊겨 방 전체가 확인 불가예요. 휴대폰 인터넷이 끊긴 상태는 아니에요.',
    group: 'seats',
    links: [list, room, seat('A-01')],
  },
  'seat-details': {
    title: '좌석마다 다른 상세',
    description:
      '확인 불가 이유 여섯 가지와 이유 없음, 모르는 이유, 모르는 상태를 좌석마다 하나씩 담았어요.',
    group: 'seats',
    links: [room, seat('A-01'), seat('B-01'), seat('B-02'), seat('B-03')],
  },
  'many-seats': {
    title: '좌석이 40개인 방',
    description: '좌석이 작아져 “확대” 버튼이 생겨요.',
    group: 'seats',
    links: [list, room],
  },
  'no-seats': {
    title: '좌석이 없는 방',
    description: '좌석이 아직 등록되지 않은 방이에요.',
    group: 'seats',
    links: [list, room],
  },
  default: {
    title: '기본',
    description: 'mixed 와 같아요. 주소에 시나리오가 없을 때 이 상태로 열려요.',
    group: 'seats',
    links: [list, room],
  },
  'rooms-many': {
    title: '방이 여섯 개',
    description: '여유, 혼잡, 모름, 장치 끊김, 좌석 없음, 아주 긴 이름의 방이 한 목록에 있어요.',
    group: 'rooms',
    links: [
      list,
      { label: '제2실습실', path: '/rooms/IT4-102' },
      { label: '긴 이름의 방', path: '/rooms/IT4-106' },
    ],
  },
  'rooms-empty': {
    title: '방이 하나도 없음',
    description: '등록된 방이 없을 때의 첫 화면이에요. 좌석도는 “이 방을 찾을 수 없어요”로 보여요.',
    group: 'rooms',
    links: [list, room],
  },
  'rooms-refresh-fail': {
    title: '방 목록 갱신 실패',
    description:
      '처음에는 정상이고, 30초쯤 뒤 다시 불러오기에 실패해 “갱신하지 못했어요”가 보여요.',
    group: 'rooms',
    links: [list],
  },
  loading: {
    title: '응답이 오지 않는 서버',
    description: '5초 뒤 “깨우는 중”, 60초 뒤 “오래 걸림”, 90초에 오류 화면이에요.',
    group: 'waiting',
    links: [list, room],
  },
  'slow-wake': {
    title: '깨어나는 서버',
    description: '5초 뒤 “깨우는 중”, 60초 뒤 “오래 걸림”이 보이고 65초에 정상 화면이 떠요.',
    group: 'waiting',
    links: [list, room],
  },
  error: {
    title: '불러오기 실패',
    description: '서버가 오류를 돌려줘 오류 화면이 보여요.',
    group: 'waiting',
    links: [list, room],
  },
  'not-found': {
    title: '없는 방',
    description: '방 목록은 비어 있고, 좌석도는 “이 방을 찾을 수 없어요”로 보여요.',
    group: 'waiting',
    links: [list, room],
  },
  'live-demo': {
    title: '좌석이 계속 바뀌는 방',
    description:
      '3초마다 좌석 하나가 바뀌어 강조되고, 가끔 장치가 끊겼다 돌아와요. 좌석도에서만 움직여요.',
    group: 'live',
    links: [room, list],
  },
  'live-flow': {
    title: '실시간 연결 첫 장면',
    description: '장치가 끊긴 1석짜리 방이에요. 자동 테스트용이라 화면이 바뀌지 않아요.',
    group: 'live',
    links: [room],
  },
  'ws-reject': {
    title: '첫 연결 실패 뒤 다시 연결',
    description: '화면은 mixed 와 같아요. 첫 실시간 연결이 거절된 뒤 다시 연결해요.',
    group: 'live',
    links: [room],
  },
  'ws-slow-close': {
    title: '연결되자마자 끊김',
    description: '화면은 mixed 와 같아요. 연결되자마자 끊기면 다시 연결하고 다시 불러와요.',
    group: 'live',
    links: [room],
  },
  'ws-down': {
    title: '실시간 연결 불가',
    description: '화면은 mixed 와 같아요. 실시간 연결이 계속 실패해 30초마다 다시 불러오기만 해요.',
    group: 'live',
    links: [room],
  },
  'stats-seed': {
    title: '평소 값만 있는 방',
    description:
      '오늘 기록은 없고 평소 값만 예시 데이터인 방이에요. 배포 서버와 시연 당일 모습이에요.',
    group: 'stats',
    links: [room],
  },
  'stats-mixed': {
    title: '평소 값이 섞인 방',
    description: '평소 값에 예시 데이터가 섞인 방이에요.',
    group: 'stats',
    links: [room],
  },
  'stats-empty': {
    title: '통계 기록이 없는 방',
    description: '오늘도 평소도 기록이 없는 방이에요.',
    group: 'stats',
    links: [room],
  },
  'stats-error': {
    title: '통계 불러오기 실패',
    description: '좌석은 보이지만 혼잡도 통계를 불러오지 못하는 방이에요.',
    group: 'stats',
    links: [room],
  },
  'stats-loading': {
    title: '통계를 계속 불러오는 방',
    description: '혼잡도 통계를 계속 불러오는 중인 방이에요.',
    group: 'stats',
    links: [room],
  },
}

export const commonLinks: readonly (GuideLink & { scenario: string })[] = [
  { label: '없는 방', path: '/rooms/NOPE', scenario: 'mixed' },
  { label: '없는 페이지', path: '/no-such-page', scenario: 'mixed' },
]
