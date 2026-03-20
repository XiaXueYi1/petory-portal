import type { AuthProfile } from '../auth.types';

export interface LoginResponseDto {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: 'Bearer';
  expiresIn: number;
  refreshExpiresIn: number;
  authMode: 'cookie' | 'token';
  profile: AuthProfile;
}
