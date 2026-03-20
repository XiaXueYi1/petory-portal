import type { AuthProfile } from '../auth.types';

export interface LoginResponseDto {
  accessToken?: string;
  tokenType?: 'Bearer';
  expiresIn: number;
  authMode: 'cookie' | 'token';
  profile: AuthProfile;
}
