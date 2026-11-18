export const DRAG_CLOSE_RATIO = 0.25
export const DRAG_CLOSE_VELOCITY = 500

// 아래로만 닫는다. 이동이 시트 높이의 4분의 1 이상이거나 아래 속도가 500px/s 이상이면 닫힌다.
export function shouldClose(input: {
  offsetY: number
  velocityY: number
  height: number
}): boolean {
  return input.offsetY >= input.height * DRAG_CLOSE_RATIO || input.velocityY >= DRAG_CLOSE_VELOCITY
}
