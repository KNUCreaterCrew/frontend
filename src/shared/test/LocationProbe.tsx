import { useEffect } from 'react'
import { useLocation, type Location } from 'react-router'

// 테스트가 주소(search, state)를 읽도록 현재 location 을 밖으로 알린다. 화면에는 아무것도 그리지 않는다.
export function LocationProbe({ onLocation }: { onLocation: (location: Location) => void }) {
  const location = useLocation()
  useEffect(() => onLocation(location), [location, onLocation])
  return null
}
