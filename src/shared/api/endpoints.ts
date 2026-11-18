export const endpoints = {
  room: (roomId: string): string => `/api/v1/rooms/${encodeURIComponent(roomId)}`,
} as const
