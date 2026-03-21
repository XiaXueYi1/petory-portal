const DEFAULTS = {
  apiBaseUrl: 'http://localhost:3000/v1',
  authTokenKey: 'petory_mini_access_token',
  authHeaderName: 'Authorization',
  authHeaderPrefix: 'Bearer',
  requestTimeout: 10000,
  loginStrategy: 'phone-appcode',
  wechatPhoneLoginStatus: 'auth4-ready'
} as const

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const miniEnv = {
  appId: process.env.TARO_APP_ID || '',
  apiBaseUrl: process.env.TARO_APP_API_BASE_URL || DEFAULTS.apiBaseUrl,
  authTokenKey: process.env.TARO_APP_AUTH_TOKEN_KEY || DEFAULTS.authTokenKey,
  authHeaderName: process.env.TARO_APP_AUTH_HEADER_NAME || DEFAULTS.authHeaderName,
  authHeaderPrefix: process.env.TARO_APP_AUTH_HEADER_PREFIX || DEFAULTS.authHeaderPrefix,
  requestTimeout: toNumber(process.env.TARO_APP_REQUEST_TIMEOUT, DEFAULTS.requestTimeout),
  loginStrategy: process.env.TARO_APP_LOGIN_STRATEGY || DEFAULTS.loginStrategy,
  wechatPhoneLoginStatus: process.env.TARO_APP_WECHAT_PHONE_LOGIN_STATUS || DEFAULTS.wechatPhoneLoginStatus
} as const
