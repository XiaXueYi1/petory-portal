import type { AuthProfile, LoginPayload } from './types'
import { request } from '@/shared/lib/request'

export function login(payload: LoginPayload) {
  return request<unknown>('/auth/login', {
    method: 'POST',
    body: payload,
  })
}

export function getProfile(signal?: AbortSignal) {
  return request<AuthProfile>('/auth/profile', {
    method: 'GET',
    signal,
  })
}

export function logout() {
  return request<null>('/auth/logout', {
    method: 'POST',
  })
}
