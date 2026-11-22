import type { MockHandler } from './handlers/rooms'
import { ROOM_ID, mixedRoom, toListItemDto } from './fixtures/rooms'
import { statsHandlers } from './handlers/stats'
import { quietRoomSocket, roomHandler, roomListHandler } from './handlers/rooms'

export const handlers: MockHandler[] = [
  roomHandler({ [ROOM_ID]: mixedRoom }),
  roomListHandler([toListItemDto(mixedRoom)]),
  ...statsHandlers(),
  quietRoomSocket(),
]
