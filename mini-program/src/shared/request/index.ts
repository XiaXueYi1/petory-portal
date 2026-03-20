import { miniEnv } from '@/shared/config/env'
import { MiniHttpClient } from './client'

export const miniHttp = new MiniHttpClient({
  baseURL: miniEnv.apiBaseUrl,
  tokenKey: miniEnv.authTokenKey,
  authHeaderName: miniEnv.authHeaderName,
  authHeaderPrefix: miniEnv.authHeaderPrefix,
  timeout: miniEnv.requestTimeout
})

export * from './client'
export * from './types'
