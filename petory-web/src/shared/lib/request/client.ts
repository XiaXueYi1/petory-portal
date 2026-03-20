import axios, { AxiosError } from 'axios'
import type {
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  Method,
} from 'axios'
import { env } from '@/shared/config/env'
import type {
  ApiEnvelope,
  HttpMutationInput,
  HttpQueryInput,
  HttpRequestOptions,
} from '@/shared/lib/request/types'

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

type InternalRequestInput<TPayload = unknown> = {
  method: Method
  url: string
  payload?: TPayload
  options?: HttpRequestOptions
}

export class ApiError extends Error {
  status: number
  code: number | string | null
  payload: unknown

  constructor(
    message: string,
    options: {
      status: number
      code?: number | string | null
      payload?: unknown
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code ?? null
    this.payload = options.payload ?? null
  }
}

export class HttpClient {
  private readonly client: AxiosInstance
  private readonly refreshClient: AxiosInstance
  private refreshPromise: Promise<void> | null = null

  constructor(config?: {
    baseURL?: string
    timeout?: number
  }) {
    this.client = this.createInstance(config)
    this.refreshClient = this.createInstance(config)
    this.attachRequestInterceptors(this.client)
    this.attachRequestInterceptors(this.refreshClient)

    this.client.interceptors.response.use(
      (response) => this.unwrapResponse(response),
      async (error: AxiosError) => this.handleError(error),
    )
  }

  get<T>({ url, options }: HttpQueryInput): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      options,
    })
  }

  post<T, TPayload = unknown>({
    url,
    payload,
    options,
  }: HttpMutationInput<TPayload>): Promise<T> {
    return this.request<T, TPayload>({
      method: 'POST',
      url,
      payload,
      options,
    })
  }

  put<T, TPayload = unknown>({
    url,
    payload,
    options,
  }: HttpMutationInput<TPayload>): Promise<T> {
    return this.request<T, TPayload>({
      method: 'PUT',
      url,
      payload,
      options,
    })
  }

  patch<T, TPayload = unknown>({
    url,
    payload,
    options,
  }: HttpMutationInput<TPayload>): Promise<T> {
    return this.request<T, TPayload>({
      method: 'PATCH',
      url,
      payload,
      options,
    })
  }

  delete<T, TPayload = unknown>({
    url,
    payload,
    options,
  }: HttpMutationInput<TPayload>): Promise<T> {
    return this.request<T, TPayload>({
      method: 'DELETE',
      url,
      payload,
      options,
    })
  }

  createAbortController() {
    return new AbortController()
  }

  isAbortError(error: unknown): boolean {
    return axios.isCancel(error)
  }

  private request<T, TPayload = unknown>({
    method,
    url,
    payload,
    options,
  }: InternalRequestInput<TPayload>): Promise<T> {
    return this.client.request<T, T>({
      method,
      url,
      data: payload,
      ...options,
    })
  }

  private attachRequestInterceptors(instance: AxiosInstance) {
    instance.interceptors.request.use((requestConfig) => {
      const headers = axios.AxiosHeaders.from(
        requestConfig.headers,
      ) as AxiosHeaders
      if (!headers.has('x-client-type')) {
        headers.set('x-client-type', 'web')
      }
      requestConfig.headers = headers
      return requestConfig
    })
  }

  private createInstance(config?: {
    baseURL?: string
    timeout?: number
  }) {
    return axios.create({
      baseURL: config?.baseURL ?? env.apiBaseUrl,
      timeout: config?.timeout ?? env.requestTimeout,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  private unwrapResponse<T>(response: AxiosResponse<T | ApiEnvelope<T>>): T {
    const payload = response.data

    if (isApiEnvelope<T>(payload)) {
      return payload.data as T
    }

    return payload as T
  }

  private async handleError(error: AxiosError): Promise<never> {
    const requestConfig = error.config as RetriableRequestConfig | undefined

    if (this.shouldRefresh(error, requestConfig)) {
      await this.refreshAccessToken()
      requestConfig._retry = true
      return this.client.request(requestConfig)
    }

    throw this.toApiError(error)
  }

  private shouldRefresh(
    error: AxiosError,
    config?: RetriableRequestConfig,
  ): config is RetriableRequestConfig {
    if (!env.authRefreshEnabled || !config || config._retry) {
      return false
    }

    if (config.skipAuthRefresh) {
      return false
    }

    const status = error.response?.status
    const url = config.url ?? ''

    if (status !== 401) {
      return false
    }

    return (
      !url.includes(env.authRefreshPath) &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/logout')
    )
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshClient
        .post(env.authRefreshPath, undefined, {
          skipAuthRefresh: true,
        } as AxiosRequestConfig)
        .then(() => undefined)
        .finally(() => {
          this.refreshPromise = null
        })
    }

    return this.refreshPromise
  }

  private toApiError(error: AxiosError): ApiError {
    const status = error.response?.status ?? 500
    const payload = error.response?.data

    if (axios.isCancel(error)) {
      return new ApiError('Request was canceled.', {
        status: 499,
        payload,
      })
    }

    if (isApiEnvelope(payload) && typeof payload.message === 'string') {
      return new ApiError(payload.message, {
        status,
        code: payload.code ?? null,
        payload,
      })
    }

    if (typeof payload === 'string' && payload.trim()) {
      return new ApiError(payload, {
        status,
        payload,
      })
    }

    return new ApiError('Request failed. Please try again later.', {
      status,
      payload,
    })
  }
}

export const http = new HttpClient()

function isApiEnvelope<T = unknown>(payload: unknown): payload is ApiEnvelope<T> {
  return typeof payload === 'object' && payload !== null && 'data' in payload
}
