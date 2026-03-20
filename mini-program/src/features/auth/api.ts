import { miniHttp } from '@/shared/request'
import type { MiniWechatPhoneLoginRequest, MiniWechatPhoneLoginResponse } from './index'

export function loginWithWechatPhone(payload: MiniWechatPhoneLoginRequest) {
  return miniHttp.post<MiniWechatPhoneLoginResponse, MiniWechatPhoneLoginRequest>(
    '/auth/wechat-mini/login',
    payload,
    { auth: false }
  )
}
