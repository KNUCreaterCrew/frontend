import { DRAG_CLOSE_RATIO, DRAG_CLOSE_VELOCITY, shouldClose } from './drag'

test('기준 상수', () => {
  expect(DRAG_CLOSE_RATIO).toBe(0.25)
  expect(DRAG_CLOSE_VELOCITY).toBe(500)
})

test.each([
  [{ offsetY: 96, velocityY: 100 }, false],
  [{ offsetY: 100, velocityY: 100 }, true],
  [{ offsetY: 20, velocityY: 500 }, true],
  [{ offsetY: 20, velocityY: 499 }, false],
  [{ offsetY: -50, velocityY: -800 }, false],
])('높이 400 에서 %j 은 닫힘 %s', (input, expected) => {
  expect(shouldClose({ ...input, height: 400 })).toBe(expected)
})

test('높이를 아직 재지 못했고(0) 움직이지 않았으면 닫지 않는다', () => {
  expect(shouldClose({ offsetY: 0, velocityY: 0, height: 0 })).toBe(false)
})
