function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') {
    return fallback
  }

  return value === 'true'
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') {
    return fallback
  }

  const nextValue = Number(value)
  return Number.isFinite(nextValue) ? nextValue : fallback
}

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Petory Portal',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  requestTimeout: parseNumber(import.meta.env.VITE_REQUEST_TIMEOUT, 10_000),
  authRefreshEnabled: parseBoolean(
    import.meta.env.VITE_AUTH_REFRESH_ENABLED,
    true,
  ),
  authRefreshPath: import.meta.env.VITE_AUTH_REFRESH_PATH || '/auth/refresh',
  authPasswordAesKeyBase64:
    import.meta.env.VITE_AUTH_PASSWORD_AES_KEY_BASE64 || '',
  authPasswordAesIvBase64:
    import.meta.env.VITE_AUTH_PASSWORD_AES_IV_BASE64 || '',
} as const
