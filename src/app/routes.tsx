import { Route, Routes } from 'react-router'
import { NotFoundPage } from '@/pages/not-found'
import { RoomsPage } from '@/pages/rooms'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoomsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
