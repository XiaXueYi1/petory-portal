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

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

const API_BASE_URL = '/v1'

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const payload = await parsePayload(response)

  if (!response.ok) {
    throw new ApiError(resolveErrorMessage(payload), {
      status: response.status,
      code: resolveErrorCode(payload),
      payload,
    })
  }

  return unwrapResponse<T>(payload)
}

async function parsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  if (contentType.includes('text/')) {
    return response.text()
  }

  return null
}

function unwrapResponse<T>(payload: unknown): T {
  if (isApiEnvelope(payload)) {
    return payload.data as T
  }

  return payload as T
}

function resolveErrorMessage(payload: unknown): string {
  if (isApiEnvelope(payload) && typeof payload.message === 'string') {
    return payload.message
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  return '请求失败，请稍后重试。'
}

function resolveErrorCode(payload: unknown): number | string | null {
  if (isApiEnvelope(payload)) {
    return payload.code ?? null
  }

  return null
}

function isApiEnvelope(
  payload: unknown,
): payload is {
  code?: number | string
  message?: string
  data?: unknown
} {
  return typeof payload === 'object' && payload !== null
}
