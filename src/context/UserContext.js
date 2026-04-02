import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react'
import Storage from '../utils/storage'
import { useNavigate } from 'react-router-dom'

const UserContext = createContext({
  user: null,
  setUser: () => {},
  clearUser: () => {},
  logout: () => {}
})

export const UserProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const stored = await Storage.get('user')
      if (isMounted && stored) {
        const role = getUserRole(stored)
        setUserState({...stored, role})
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const setUser = useCallback(async userData => {
    await Storage.set('user', userData)
    setUserState(userData)
  }, [])

  const getUserRole = (user) => {
    const roles = user?.role_columns?.roles || []
    if (roles.length === 0) {
      return null
    }
    if (roles.length === 1) {
      return roles[0]
    }
  
    const other = roles.filter(r => r !== 'employee')
    return other.length > 0
      ? other[0]
      : 'employee'
  }

  const clearUser = useCallback(() => {
    Storage.remove('user')
    setUserState(null)
  }, [])

  const logout = useCallback(() => {
    setTimeout(() => {
      clearUser()
      navigate('/');
    }, 100);
  }, [clearUser, navigate])

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}


export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
