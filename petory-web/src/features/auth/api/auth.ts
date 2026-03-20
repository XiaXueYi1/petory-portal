import type { AuthProfile, LoginPayload, LoginResult } from './types'
import { http } from '@/shared/lib/request'

export function login(payload: LoginPayload) {
  return http.post<LoginResult>({
    url: '/auth/login',
    payload,
  })
}

export function getProfile(signal?: AbortSignal) {
  return http.get<AuthProfile>({
    url: '/auth/profile',
    options: {
      signal,
    },
  })
}

export function logout() {
  return http.post<null>({
    url: '/auth/logout',
  })
}

export function refreshSession() {
  return http.post<null>({
    url: '/auth/refresh',
    options: {
      skipAuthRefresh: true,
    },
  })
}
