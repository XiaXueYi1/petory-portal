import type { AxiosRequestConfig } from 'axios'

export type ApiEnvelope<T = unknown> = {
  code?: number | string
  message?: string
  data?: T
  timestamp?: number
}

export type HttpRequestOptions = Omit<
  AxiosRequestConfig,
  'baseURL' | 'method' | 'url' | 'data'
> & {
  skipAuthRefresh?: boolean
}

export type HttpQueryInput = {
  url: string
  options?: HttpRequestOptions
}

export type HttpMutationInput<TPayload = unknown> = {
  url: string
  payload?: TPayload
  options?: HttpRequestOptions
}
