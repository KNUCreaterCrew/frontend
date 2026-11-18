import { Route, Routes } from 'react-router'
import { NotFoundPage } from '@/pages/not-found'
import { RoomPage } from '@/pages/room'
import { RoomsPage } from '@/pages/rooms'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoomsPage />} />
      <Route path="/rooms/:roomId" element={<RoomPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
