export interface MiniWechatPhoneLoginRequest {
  code: string
  phoneCode: string
}

export interface MiniAuthProfile {
  user: {
    id: string
    username: string
    nickname: string
    avatar: string
    email?: string | null
    phone?: string | null
  }
  roles: string[]
  permissions: string[]
  menus: MiniAuthMenu[]
}

export interface MiniAuthMenu {
  id: string
  parentId: string | null
  code: string
  name: string
  path: string
  componentKey: string
  icon?: string | null
  permissionCode?: string | null
  children: MiniAuthMenu[]
}

export interface MiniWechatPhoneLoginResponse {
  accessToken: string
  refreshToken?: string
  tokenType?: 'Bearer'
  expiresIn?: number
  refreshExpiresIn?: number
  authMode?: 'token'
  profile: MiniAuthProfile
}
