import type { AxiosRequestHeaders, Method } from 'axios'

export type MiniHttpMethod =
  | Uppercase<Method>
  | Lowercase<Method>

export interface MiniApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: number
}

export interface MiniRequestOptions<TBody = any> {
  url: string
  method?: MiniHttpMethod
  data?: TBody
  auth?: boolean
  headers?: AxiosRequestHeaders | Record<string, string>
  timeout?: number
}

export interface MiniHttpClientConfig {
  baseURL: string
  tokenKey: string
  authHeaderName?: string
  authHeaderPrefix?: string
  timeout?: number
}
