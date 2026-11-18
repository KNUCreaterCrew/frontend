import type { RequestHandler } from 'msw'
import { ROOM_ID, mixedRoom } from './fixtures/rooms'
import { roomHandler } from './handlers/rooms'

export const handlers: RequestHandler[] = [roomHandler({ [ROOM_ID]: mixedRoom })]
