import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request } from 'express';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type {
  AccessTokenPayload,
  AuthClientType,
  AuthSubjectRecord,
  IssuedTokens,
  RefreshTokenPayload,
} from '@/modules/auth/auth.types';

@Injectable()
export class AuthTokenService {
  constructor(private readonly configService: ConfigService) {}

  issueTokens(
    subject: Pick<AuthSubjectRecord, 'userId' | 'username'>,
    clientType: AuthClientType,
    sessionId?: string,
  ): IssuedTokens {
    const activeSessionId = sessionId ?? randomUUID();
    const issuedAt = Math.floor(Date.now() / 1000);
    const accessExpiresIn = this.getAccessTokenTtlSeconds();
    const refreshExpiresIn = this.getRefreshTokenTtlSeconds();
    const refreshTokenId = randomUUID();

    const accessToken = this.signToken<AccessTokenPayload>(
      {
        sub: subject.userId,
        username: subject.username,
        clientType,
        sid: activeSessionId,
        type: 'access',
        iss: this.getTokenIssuer(),
        aud: this.getTokenAudience(),
        iat: issuedAt,
        exp: issuedAt + accessExpiresIn,
      },
      this.getAccessTokenSecret(),
    );

    const refreshToken = this.signToken<RefreshTokenPayload>(
      {
        sub: subject.userId,
        username: subject.username,
        clientType,
        sid: activeSessionId,
        jti: refreshTokenId,
        type: 'refresh',
        iss: this.getTokenIssuer(),
        aud: this.getTokenAudience(),
        iat: issuedAt,
        exp: issuedAt + refreshExpiresIn,
      },
      this.getRefreshTokenSecret(),
    );

    return {
      accessToken,
      refreshToken,
      accessExpiresIn,
      refreshExpiresIn,
      sessionId: activeSessionId,
      refreshTokenId,
    };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    return this.verifyToken<AccessTokenPayload>(
      token,
      this.getAccessTokenSecret(),
      'access',
    );
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    return this.verifyToken<RefreshTokenPayload>(
      token,
      this.getRefreshTokenSecret(),
      'refresh',
    );
  }

  extractAccessToken(request: Request): string {
    const cookieToken = this.getCookieValue(
      request,
      this.getAccessCookieName(),
    );

    if (cookieToken) {
      return cookieToken;
    }

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing access token');
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    return token;
  }

  extractRefreshTokenFromCookie(request: Request): string {
    const token = this.getCookieValue(request, this.getRefreshCookieName());

    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return token;
  }

  getAccessCookieName(): string {
    return this.configService.getOrThrow<string>('AUTH_WEB_ACCESS_COOKIE_NAME');
  }

  getRefreshCookieName(): string {
    return this.configService.getOrThrow<string>(
      'AUTH_WEB_REFRESH_COOKIE_NAME',
    );
  }

  buildCookieOptions(maxAgeMs: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.getBooleanConfig('AUTH_COOKIE_SECURE'),
      sameSite: this.getSameSiteConfig(),
      path: '/',
      maxAge: maxAgeMs,
    };
  }

  buildClearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.getBooleanConfig('AUTH_COOKIE_SECURE'),
      sameSite: this.getSameSiteConfig(),
      path: '/',
    };
  }

  getRefreshSessionKey(sessionId: string): string {
    return `${this.configService.getOrThrow<string>('AUTH_REFRESH_SESSION_PREFIX')}:${sessionId}`;
  }

  getAccessTokenTtlSeconds(): number {
    return this.getNumberConfig('AUTH_ACCESS_TOKEN_TTL_SECONDS');
  }

  getRefreshTokenTtlSeconds(): number {
    return this.getNumberConfig('AUTH_REFRESH_TOKEN_TTL_SECONDS');
  }

  private verifyToken<
    T extends { iss: string; aud: string; exp: number; type: string },
  >(token: string, secret: string, expectedType: T['type']): T {
    const [headerSegment, payloadSegment, signatureSegment] = token.split('.');

    if (!headerSegment || !payloadSegment || !signatureSegment) {
      throw new UnauthorizedException('Invalid token format');
    }

    const expectedSignature = this.signSignature(
      `${headerSegment}.${payloadSegment}`,
      secret,
    );

    if (!this.safeEqual(signatureSegment, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(
      Buffer.from(payloadSegment, 'base64url').toString('utf8'),
    ) as T;

    if (
      payload.type !== expectedType ||
      payload.iss !== this.getTokenIssuer() ||
      payload.aud !== this.getTokenAudience()
    ) {
      throw new UnauthorizedException('Invalid token claims');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private signToken<T extends object>(payload: T, secret: string): string {
    const headerSegment = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const payloadSegment = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signatureSegment = this.signSignature(
      `${headerSegment}.${payloadSegment}`,
      secret,
    );

    return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
  }

  private signSignature(content: string, secret: string): string {
    return createHmac('sha256', secret).update(content).digest('base64url');
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }

  private getCookieValue(request: Request, name: string): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map((item) => item.trim());
    const target = cookies.find((item) => item.startsWith(`${name}=`));

    if (!target) {
      return undefined;
    }

    return decodeURIComponent(target.slice(name.length + 1));
  }

  private getNumberConfig(key: string): number {
    const value = Number(this.configService.getOrThrow<string>(key));

    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`Invalid numeric configuration: ${key}`);
    }

    return value;
  }

  private getBooleanConfig(key: string): boolean {
    return this.configService.get<string>(key, 'false') === 'true';
  }

  private getSameSiteConfig(): 'lax' | 'strict' | 'none' {
    const value = this.configService.get<string>(
      'AUTH_COOKIE_SAME_SITE',
      'lax',
    );

    if (value === 'lax' || value === 'strict' || value === 'none') {
      return value;
    }

    throw new Error('Invalid AUTH_COOKIE_SAME_SITE configuration');
  }

  private getAccessTokenSecret(): string {
    return this.configService.getOrThrow<string>('AUTH_ACCESS_TOKEN_SECRET');
  }

  private getRefreshTokenSecret(): string {
    return this.configService.getOrThrow<string>('AUTH_REFRESH_TOKEN_SECRET');
  }

  private getTokenIssuer(): string {
    return this.configService.getOrThrow<string>('AUTH_TOKEN_ISSUER');
  }

  private getTokenAudience(): string {
    return this.configService.getOrThrow<string>('AUTH_TOKEN_AUDIENCE');
  }
}
