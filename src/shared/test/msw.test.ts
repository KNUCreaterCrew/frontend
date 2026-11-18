test('핸들러가 없는 API 요청은 실패한다', async () => {
  await expect(fetch('http://localhost/api/v1/rooms/IT4-101')).rejects.toThrow()
})

test('실패 원인은 MSW 의 미처리 요청 차단이다', async () => {
  const error = await fetch('http://localhost/api/v1/rooms/IT4-101').catch((e: unknown) => e)
  expect(String((error as Error).cause)).toMatch(/\[MSW\]/)
})
