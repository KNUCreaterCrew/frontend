export const endpoints = {
  rooms: (): '/api/v1/rooms' => '/api/v1/rooms',
  room: (roomId: string): string => `/api/v1/rooms/${encodeURIComponent(roomId)}`,
  roomDailyStats: (roomId: string, date: string): string =>
    `/api/v1/rooms/${encodeURIComponent(roomId)}/stats/daily?date=${encodeURIComponent(date)}`,
  roomWeeklyStats: (roomId: string, weeks: number): string =>
    `/api/v1/rooms/${encodeURIComponent(roomId)}/stats/weekly?weeks=${weeks}`,
  roomSocket: (roomId: string): string => `/ws/rooms/${encodeURIComponent(roomId)}`,
} as const
