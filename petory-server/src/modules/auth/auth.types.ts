export interface AuthMenu {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  path: string;
  componentKey: string;
  permissionCode: string;
  children: AuthMenu[];
}

export interface AuthUserRecord {
  id: string;
  username: string;
  password: string;
  nickname: string;
  avatar: string;
  email: string | null;
  roles: string[];
  permissions: string[];
  menus: AuthMenu[];
}

export interface AuthProfile {
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    email: string | null;
  };
  roles: string[];
  permissions: string[];
  menus: AuthMenu[];
}

export interface JwtAccessPayload {
  sub: string;
  username: string;
  roles: string[];
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: 'access';
}
