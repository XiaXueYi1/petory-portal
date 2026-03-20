import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Spin } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/features/auth/api'
import { useAuthStore } from '@/app/store/auth.store'
import { ApiError } from '@/shared/lib/request'

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const status = useAuthStore((state) => state.status)
  const setLoading = useAuthStore((state) => state.setLoading)
  const setProfile = useAuthStore((state) => state.setProfile)
  const clearProfile = useAuthStore((state) => state.clearProfile)

  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: ({ signal }) => getProfile(signal),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (profileQuery.isPending) {
      setLoading()
      return
    }

    if (profileQuery.isSuccess) {
      setProfile(profileQuery.data)
      return
    }

    if (profileQuery.isError) {
      if (profileQuery.error instanceof ApiError && profileQuery.error.status === 401) {
        clearProfile()
        return
      }

      clearProfile()
    }
  }, [
    clearProfile,
    profileQuery.data,
    profileQuery.error,
    profileQuery.isError,
    profileQuery.isPending,
    profileQuery.isSuccess,
    setLoading,
    setProfile,
  ])

  if ((status === 'idle' || status === 'loading') && profileQuery.isPending) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spin size="large" />
      </div>
    )
  }

  return <>{children}</>
}
