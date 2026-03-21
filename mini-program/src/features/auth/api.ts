import { miniHttp } from '@/shared/request'
import type { MiniPhoneAppCodeLoginRequest, MiniPhoneAppCodeLoginResponse } from './index'

export function loginWithMiniPhoneAppCode(payload: MiniPhoneAppCodeLoginRequest) {
  return miniHttp.post<MiniPhoneAppCodeLoginResponse, MiniPhoneAppCodeLoginRequest>(
    '/auth/wechat-mini/login',
    payload,
    { auth: false }
  )
}
