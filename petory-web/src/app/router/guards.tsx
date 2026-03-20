import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth.store'

type GuardProps = {
  children: ReactNode
}

export function RequireAuth({ children }: GuardProps) {
  const status = useAuthStore((state) => state.status)
  const location = useLocation()

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function RedirectIfAuthenticated({ children }: GuardProps) {
  const status = useAuthStore((state) => state.status)

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
