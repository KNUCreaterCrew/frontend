import type { MockHandler } from './handlers/rooms'
import { ROOM_ID, mixedRoom } from './fixtures/rooms'
import { quietRoomSocket, roomHandler } from './handlers/rooms'

export const handlers: MockHandler[] = [roomHandler({ [ROOM_ID]: mixedRoom }), quietRoomSocket()]
