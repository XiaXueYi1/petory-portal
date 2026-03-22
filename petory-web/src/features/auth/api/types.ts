export type LoginPayload = {
  phone: string
  password: string
}

export type LoginResult = {
  authMode?: 'cookie' | 'token'
  expiresIn?: number
}

export type AuthUser = {
  id: string
  nickname: string
  avatar?: string
  email?: string
  phone?: string
}

export type AuthMenu = {
  id: string
  parentId: string | null
  code: string
  name: string
  path: string
  componentKey: string
  permissionCode?: string
  children?: AuthMenu[]
}

export type AuthProfile = {
  user: AuthUser
  roles: string[]
  permissions: string[]
  menus: AuthMenu[]
}
