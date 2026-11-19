import { useEffect } from 'react'
import { Route, Routes } from 'react-router'
import type { MockingResult } from '@/app/enableMocking'
import { AppRoutes } from '@/app/routes'
import { PreviewBand } from './ui/PreviewBand'
import { ScenarioPicker } from './ui/ScenarioPicker'
import './preview.css'

const TITLE_PREFIX = '미리보기 '

export function PreviewRoot(props: MockingResult) {
  useEffect(() => {
    document.documentElement.classList.add('preview')
    if (!document.title.startsWith(TITLE_PREFIX)) {
      document.title = TITLE_PREFIX + document.title
    }
  }, [])
  return (
    <Routes>
      <Route
        path="/__preview"
        element={
          <>
            <PreviewBand scenario={props.scenario} showSwitch={false} />
            <ScenarioPicker {...props} />
          </>
        }
      />
      <Route
        path="*"
        element={
          <>
            <PreviewBand scenario={props.scenario} showSwitch />
            <AppRoutes />
          </>
        }
      />
    </Routes>
  )
}
