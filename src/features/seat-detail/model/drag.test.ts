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
