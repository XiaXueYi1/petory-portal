export type LoginPayload = {
  username: string
  password: string
}

export type AuthUser = {
  id: string
  nickname: string
  avatar?: string
  email?: string
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
