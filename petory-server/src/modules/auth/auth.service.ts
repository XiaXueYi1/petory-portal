import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { AppException } from '../../common';
import { HTTP_ERROR_CODE } from '../../common/constants';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
  SESSION_COOKIE_NAME,
} from './auth.constants';
import type { LoginDto, LoginResponseDto } from './dto';
import { AuthRepository } from './repository/auth.repository';
import type { JwtAccessPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  login(payload: LoginDto): LoginResponseDto {
    const username = payload.username?.trim();
    const password = payload.password?.trim();
    const clientType = payload.clientType ?? 'web';

    if (!username || !password) {
      throw new AppException({
        code: HTTP_ERROR_CODE.UNAUTHORIZED,
        message: 'Username and password are required',
      });
    }

    const user = this.authRepository.findUserByUsername(username);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = this.signAccessToken({
      sub: user.id,
      username: user.username,
      roles: user.roles,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      authMode: clientType === 'web' ? 'cookie' : 'token',
      profile: this.authRepository.toProfile(user),
    };
  }

  getProfile(request: Request) {
    const token = this.extractBearerToken(request);
    const payload = this.verifyAccessToken(token);
    const user = this.authRepository.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.authRepository.toProfile(user);
  }

  logout(): { success: true } {
    return {
      success: true,
    };
  }

  private extractBearerToken(request: Request): string {
    const cookieToken = this.extractCookieToken(request);
    if (cookieToken) {
      return cookieToken;
    }

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing auth token');
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    return token;
  }

  private extractCookieToken(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';').map((item) => item.trim());
    const target = cookies.find((item) =>
      item.startsWith(`${SESSION_COOKIE_NAME}=`),
    );

    if (!target) {
      return undefined;
    }

    return decodeURIComponent(target.slice(`${SESSION_COOKIE_NAME}=`.length));
  }

  private signAccessToken(
    payload: Pick<JwtAccessPayload, 'sub' | 'username' | 'roles'>,
  ): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const fullPayload: JwtAccessPayload = {
      ...payload,
      iat: issuedAt,
      exp: issuedAt + ACCESS_TOKEN_TTL_SECONDS,
      iss: JWT_ISSUER,
      aud: JWT_AUDIENCE,
      type: 'access',
    };

    const headerSegment = this.encodeBase64Url({
      alg: 'HS256',
      typ: 'JWT',
    });
    const payloadSegment = this.encodeBase64Url(fullPayload);
    const signatureSegment = this.signSignature(
      `${headerSegment}.${payloadSegment}`,
    );

    return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
  }

  private verifyAccessToken(token: string): JwtAccessPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [headerSegment, payloadSegment, signatureSegment] = parts;
    const expectedSignature = this.signSignature(
      `${headerSegment}.${payloadSegment}`,
    );

    if (!this.safeEqual(signatureSegment, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = this.decodeBase64Url<JwtAccessPayload>(payloadSegment);

    if (
      payload.type !== 'access' ||
      payload.iss !== JWT_ISSUER ||
      payload.aud !== JWT_AUDIENCE
    ) {
      throw new UnauthorizedException('Invalid token claims');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private encodeBase64Url(value: unknown): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private decodeBase64Url<T>(value: string): T {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
  }

  private signSignature(content: string): string {
    return createHmac('sha256', JWT_SECRET)
      .update(content)
      .digest('base64url');
  }

  private safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
