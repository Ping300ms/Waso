import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'

/**
 * Gates screens behind having *a* persisted session — even an expired one, since a user
 * opening the PWA offline has no way to refresh a token anyway. Only a user who has never
 * logged in on this device gets redirected to /login.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
