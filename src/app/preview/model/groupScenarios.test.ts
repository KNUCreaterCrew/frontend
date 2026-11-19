import { groupScenarios } from './groupScenarios'

test('가이드에 없는 이름은 마지막 그 밖의 시나리오 묶음으로 간다', () => {
  const groups = groupScenarios(['mixed', 'brand-new'])
  expect(groups.at(-1)).toEqual({
    id: 'other',
    title: '그 밖의 시나리오',
    names: ['brand-new'],
  })
  expect(groups[0]).toEqual({ id: 'seats', title: '좌석 상태', names: ['mixed'] })
})

test('이름이 없는 묶음은 만들지 않는다', () => {
  expect(groupScenarios(['mixed']).map((g) => g.id)).toEqual(['seats'])
})
