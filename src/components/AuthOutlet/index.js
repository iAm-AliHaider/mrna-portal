// src/components/AuthOutlet.jsx
import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Storage from '../../utils/storage'
import { canAccessRoute, getUserRole } from '../../utils/helper'
import { ROLES } from '../../utils/constants'
import { UserProvider } from '../../context/UserContext'

const ADMIN_INDEX = '/admin/company-info/general'
const EMPLOYEE_INDEX = '/home'

const redirectRoutes = {
  [ROLES.ADMIN]: ADMIN_INDEX,
  [ROLES.EMPLOYEE]: EMPLOYEE_INDEX
} 

export const AuthOutlet = () => {
  const user = Storage.get('user') || null
  const userRole = getUserRole(user)

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    if (user && pathname === '/') {
      const indexRoute = userRole === ROLES.ADMIN ? ADMIN_INDEX : EMPLOYEE_INDEX
      navigate(indexRoute, { replace: true })
    }
  }, [user, pathname, navigate, userRole])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true)
    }, 200)

    return () => {
      clearTimeout(timer)
      setShowLoader(false)
    }
  }, [pathname])

  if (!user && pathname !== '/') {
    window.location.href = '/'
    return null
  }

  if (pathname === '/') {
    return (
      <Suspense fallback={showLoader ? <div>Loading...</div> : null}>
        <Outlet />
      </Suspense>
    )
  }

  if (!canAccessRoute(pathname, userRole)) {
    const redirectRoute = redirectRoutes[userRole] || `/public/candidates/update/${user?.id || ''}`
    navigate(redirectRoute, { replace: true })
    return null
  }

  return (
    <Suspense fallback={showLoader ? <div>Loading...</div> : null}>
      <UserProvider>
        <Outlet />
      </UserProvider>
    </Suspense>
  )
}
