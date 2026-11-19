import { Route, Routes } from 'react-router'
import type { MockingResult } from '@/app/enableMocking'
import { AppRoutes } from '@/app/routes'
import { PreviewBand } from './ui/PreviewBand'
import { ScenarioPicker } from './ui/ScenarioPicker'
import './preview.css'

export function PreviewRoot(props: MockingResult) {
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
