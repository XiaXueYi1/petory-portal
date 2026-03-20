import { ConfigService } from '@nestjs/config';
import { AuthPasswordService } from './auth-password.service';
import { AuthTokenService } from './auth-token.service';

describe('Auth auth2 helpers', () => {
  const configService = new ConfigService({
    AUTH_PASSWORD_PEPPER: 'test-pepper',
    AUTH_TOKEN_ISSUER: 'petory-server',
    AUTH_TOKEN_AUDIENCE: 'petory-portal',
    AUTH_ACCESS_TOKEN_SECRET: 'access-secret',
    AUTH_REFRESH_TOKEN_SECRET: 'refresh-secret',
    AUTH_ACCESS_TOKEN_TTL_SECONDS: '900',
    AUTH_REFRESH_TOKEN_TTL_SECONDS: '604800',
    AUTH_REFRESH_SESSION_PREFIX: 'petory:auth:refresh',
    AUTH_WEB_ACCESS_COOKIE_NAME: 'pt_access_token',
    AUTH_WEB_REFRESH_COOKIE_NAME: 'pt_refresh_token',
    AUTH_COOKIE_SECURE: 'false',
    AUTH_COOKIE_SAME_SITE: 'lax',
  });

  it('hashes and verifies passwords', () => {
    const passwordService = new AuthPasswordService(configService);
    const hashedPassword = passwordService.hashPassword('123456');

    expect(passwordService.verifyPassword('123456', hashedPassword)).toBe(true);
    expect(passwordService.verifyPassword('654321', hashedPassword)).toBe(
      false,
    );
  });

  it('issues and verifies access and refresh tokens', () => {
    const tokenService = new AuthTokenService(configService);
    const tokens = tokenService.issueTokens(
      {
        userId: 'user-admin-local',
        username: 'admin',
      },
      'web',
      'session-1',
    );

    const accessPayload = tokenService.verifyAccessToken(tokens.accessToken);
    const refreshPayload = tokenService.verifyRefreshToken(tokens.refreshToken);

    expect(accessPayload.sub).toBe('user-admin-local');
    expect(accessPayload.sid).toBe('session-1');
    expect(refreshPayload.sub).toBe('user-admin-local');
    expect(refreshPayload.sid).toBe('session-1');
    expect(refreshPayload.jti).toBe(tokens.refreshTokenId);
  });
});
