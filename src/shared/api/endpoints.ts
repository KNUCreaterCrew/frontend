export const endpoints = {
  rooms: (): '/api/v1/rooms' => '/api/v1/rooms',
  room: (roomId: string): string => `/api/v1/rooms/${encodeURIComponent(roomId)}`,
  roomSocket: (roomId: string): string => `/ws/rooms/${encodeURIComponent(roomId)}`,
} as const
