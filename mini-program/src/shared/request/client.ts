import Taro from '@tarojs/taro'
import axios, { AxiosError, AxiosHeaders, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { MiniApiResponse, MiniHttpClientConfig, MiniRequestOptions } from './types'

export class MiniRequestError<T = unknown> extends Error {
  readonly code: number

  readonly data: T | undefined

  readonly statusCode: number | undefined

  constructor(message: string, code = -1, data?: T, statusCode?: number) {
    super(message)
    this.name = 'MiniRequestError'
    Object.setPrototypeOf(this, MiniRequestError.prototype)
    this.code = code
    this.data = data
    this.statusCode = statusCode
  }
}

export class MiniHttpClient {
  private readonly tokenKey: string

  private readonly authHeaderName: string

  private readonly authHeaderPrefix: string

  private readonly instance: AxiosInstance

  constructor(config: MiniHttpClientConfig) {
    this.tokenKey = config.tokenKey
    this.authHeaderName = config.authHeaderName ?? 'Authorization'
    this.authHeaderPrefix = config.authHeaderPrefix ?? 'Bearer'

    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 10000
    })

    this.registerInterceptors()
  }

  async request<TResponse = unknown, TBody = any>(options: MiniRequestOptions<TBody>) {
    try {
      const response = await this.instance.request<MiniApiResponse<TResponse>, AxiosResponse<MiniApiResponse<TResponse>>, TBody>({
        url: options.url,
        method: options.method ?? 'GET',
        data: options.data,
        headers: this.resolveHeaders(options),
        timeout: options.timeout,
        withToken: options.auth !== false
      } as AxiosRequestConfig)

      return this.resolveBusinessResponse(response.data)
    } catch (error) {
      throw this.toMiniRequestError(error)
    }
  }

  get<TResponse = unknown, TBody = any>(
    url: string,
    data?: TBody,
    options: Omit<MiniRequestOptions<TBody>, 'url' | 'method' | 'data'> = {}
  ) {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: 'GET',
      data
    })
  }

  post<TResponse = unknown, TBody = any>(
    url: string,
    data?: TBody,
    options: Omit<MiniRequestOptions<TBody>, 'url' | 'method' | 'data'> = {}
  ) {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: 'POST',
      data
    })
  }

  put<TResponse = unknown, TBody = any>(
    url: string,
    data?: TBody,
    options: Omit<MiniRequestOptions<TBody>, 'url' | 'method' | 'data'> = {}
  ) {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: 'PUT',
      data
    })
  }

  patch<TResponse = unknown, TBody = any>(
    url: string,
    data?: TBody,
    options: Omit<MiniRequestOptions<TBody>, 'url' | 'method' | 'data'> = {}
  ) {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: 'PATCH',
      data
    })
  }

  delete<TResponse = unknown, TBody = any>(
    url: string,
    data?: TBody,
    options: Omit<MiniRequestOptions<TBody>, 'url' | 'method' | 'data'> = {}
  ) {
    return this.request<TResponse, TBody>({
      ...options,
      url,
      method: 'DELETE',
      data
    })
  }

  setToken(token: string) {
    Taro.setStorageSync(this.tokenKey, token)
  }

  clearToken() {
    Taro.removeStorageSync(this.tokenKey)
  }

  getToken() {
    return Taro.getStorageSync(this.tokenKey) as string | undefined
  }

  private resolveHeaders(options: MiniRequestOptions<any>) {
    return {
      ...(options.headers ?? {})
    }
  }

  private registerInterceptors() {
    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig & { withToken?: boolean }) => {
      const headers = AxiosHeaders.from(config.headers ?? {})

      headers.set('x-client-type', 'mini-program')

      if (config.withToken !== false) {
        const token = this.getToken()
        if (token) {
          headers.set(this.authHeaderName, `${this.authHeaderPrefix} ${token}`)
        }
      }

      config.headers = headers as any
      return config
    })
  }

  private resolveBusinessResponse<TResponse>(response: MiniApiResponse<TResponse>) {
    if (typeof response?.code === 'number' && response.code !== 0) {
      throw new MiniRequestError(response.message || 'Business error', response.code, response.data)
    }

    return response.data
  }

  private toMiniRequestError(error: unknown) {
    if (error instanceof MiniRequestError) {
      return error
    }

    if (error instanceof AxiosError) {
      const responseData = error.response?.data as MiniApiResponse<unknown> | undefined
      const code = responseData?.code ?? error.response?.status ?? -1
      const message = responseData?.message || error.message || 'Request failed'
      return new MiniRequestError(message, code, responseData?.data, error.response?.status)
    }

    return new MiniRequestError('Mini request failed', -1)
  }
}
