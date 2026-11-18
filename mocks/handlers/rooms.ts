import { HttpResponse, http } from 'msw'
import type { RoomDto } from '@/entities/room'

export function roomHandler(rooms: Record<string, RoomDto>) {
  return http.get('*/api/v1/rooms/:roomId', ({ params }) => {
    const id = String(params.roomId)
    const room = Object.hasOwn(rooms, id) ? rooms[id] : undefined
    if (!room) return HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 })
    return HttpResponse.json(room)
  })
}
