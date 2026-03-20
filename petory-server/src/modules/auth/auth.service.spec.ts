import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRepository } from './repository/auth.repository';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(new AuthRepository());
  });

  it('should login with the local admin credentials', () => {
    const result = authService.login({
      username: 'admin',
      password: '123456',
    });

    expect(result.tokenType).toBe('Bearer');
    expect(result.accessToken).toBeTruthy();
    expect(result.profile.user.username).toBe('admin');
    expect(result.profile.roles).toEqual(['admin']);
  });

  it('should reject invalid credentials', () => {
    expect(() =>
      authService.login({
        username: 'admin',
        password: 'wrong-password',
      }),
    ).toThrow(UnauthorizedException);
  });

  it('should resolve profile from bearer token', () => {
    const result = authService.login({
      username: 'admin',
      password: '123456',
    });

    const profile = authService.getProfile({
      headers: {
        authorization: `Bearer ${result.accessToken}`,
      },
    } as never);

    expect(profile.user.username).toBe('admin');
    expect(profile.permissions).toContain('auth:profile');
  });
}
