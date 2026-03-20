import type { Request } from 'express';

export type AuthClientType = 'web' | 'mini-program';

export interface AuthMenu {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  path: string;
  componentKey: string;
  icon: string | null;
  permissionCode: string | null;
  children: AuthMenu[];
}

export interface AuthProfile {
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    email: string | null;
    phone: string | null;
  };
  roles: string[];
  permissions: string[];
  menus: AuthMenu[];
}

export interface AuthSubjectRecord {
  userId: string;
  username: string;
  passwordHash: string | null;
  nickname: string;
  avatar: string;
  email: string | null;
  phone: string | null;
  roles: string[];
  permissions: string[];
  menus: AuthMenu[];
  status: 'active' | 'disabled';
}

export interface AccessTokenPayload {
  sub: string;
  username: string;
  clientType: AuthClientType;
  sid: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  username: string;
  clientType: AuthClientType;
  sid: string;
  jti: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  type: 'refresh';
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
  sessionId: string;
  refreshTokenId: string;
}

export interface RefreshSessionRecord {
  sessionId: string;
  userId: string;
  username: string;
  clientType: AuthClientType;
  currentRefreshTokenId: string;
  expiresAt: number;
}

export interface AuthRequestContext {
  userId: string;
  username: string;
  clientType: AuthClientType;
  sessionId: string;
  tokenType: 'access';
}

export interface AuthenticatedRequest extends Request {
  authContext?: AuthRequestContext;
}
