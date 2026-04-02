// src/components/AuthOutlet.jsx
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Storage from '../../utils/storage'
import { UserProvider } from '../../context/UserContext'
import CandidateLayout from '../CandidateLayout'

export const CandidateOutlet = () => {
  const user = Storage.get('user') || null

  const { pathname } = useLocation()

  if (!user && pathname !== '/') {
    window.location.href = '/'
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProvider>
        <CandidateLayout>
          <Outlet />
        </CandidateLayout>
      </UserProvider>
    </Suspense>
  )
}
