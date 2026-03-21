import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  AUTH_CLIENT_TYPE_HEADER,
  AUTH_MINI_PROGRAM_CLIENT_TYPE,
  AUTH_DEV_REGISTER_SECRET_HEADER,
  AUTH_WEB_CLIENT_TYPE,
  SUPPORTED_AUTH_CLIENT_TYPES,
} from '@/modules/auth/auth.constants';
import { AuthPasswordService } from '@/modules/auth/auth-password.service';
import { AuthSessionService } from '@/modules/auth/auth-session.service';
import { AuthTokenService } from '@/modules/auth/auth-token.service';
import { WechatMiniAuthService } from '@/modules/auth/wechat-mini-auth.service';
import type {
  AuthClientType,
  AuthenticatedRequest,
  AuthProfile,
} from '@/modules/auth/auth.types';
import type {
  DevRegisterDto,
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  RefreshDto,
  WechatMiniLoginDto,
} from '@/modules/auth/dto';
import { AuthRepository } from '@/modules/auth/repository/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authPasswordService: AuthPasswordService,
    private readonly authTokenService: AuthTokenService,
    private readonly authSessionService: AuthSessionService,
    private readonly wechatMiniAuthService: WechatMiniAuthService,
  ) {}

  async login(
    payload: LoginDto,
    request: Request,
    response: Response,
  ): Promise<LoginResponseDto> {
    const clientType = this.getClientType(request);
    const phone = payload.phone.trim();
    const password = this.authPasswordService.decryptWebLoginPassword(
      payload.password.trim(),
    );
    const user = await this.authRepository.findPasswordUserByPhone(phone);

    if (
      !user ||
      user.status !== 'active' ||
      !user.passwordHash ||
      !this.authPasswordService.verifyPassword(password, user.passwordHash)
    ) {
      throw new UnauthorizedException('Invalid phone or password');
    }

    await this.authRepository.markUserLastLogin(user.userId);

    const tokens = this.authTokenService.issueTokens(user, clientType);
    await this.authSessionService.storeRefreshSession({
      sessionId: tokens.sessionId,
      userId: user.userId,
      username: user.username,
      clientType,
      currentRefreshTokenId: tokens.refreshTokenId,
      expiresAt: Math.floor(Date.now() / 1000) + tokens.refreshExpiresIn,
    });

    const profile = this.authRepository.toProfile(user);

    if (clientType === AUTH_WEB_CLIENT_TYPE) {
      this.writeWebCookies(response, tokens.accessToken, tokens.refreshToken);

      return {
        expiresIn: tokens.accessExpiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn,
        authMode: 'cookie',
        profile,
      };
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: tokens.accessExpiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      authMode: 'token',
      profile,
    };
  }

  async refresh(
    payload: RefreshDto,
    request: Request,
    response: Response,
  ): Promise<LoginResponseDto> {
    const clientType = this.getClientType(request);
    const refreshToken =
      clientType === AUTH_WEB_CLIENT_TYPE
        ? this.authTokenService.extractRefreshTokenFromCookie(request)
        : this.extractMiniRefreshToken(payload.refreshToken);

    const refreshPayload =
      this.authTokenService.verifyRefreshToken(refreshToken);
    const session = await this.authSessionService.getRefreshSession(
      refreshPayload.sid,
    );

    if (
      !session ||
      session.userId !== refreshPayload.sub ||
      session.clientType !== clientType ||
      session.currentRefreshTokenId !== refreshPayload.jti
    ) {
      throw new UnauthorizedException('Refresh session expired');
    }

    const user = await this.authRepository.findUserById(refreshPayload.sub);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = this.authTokenService.issueTokens(
      user,
      clientType,
      refreshPayload.sid,
    );

    await this.authSessionService.storeRefreshSession({
      sessionId: tokens.sessionId,
      userId: user.userId,
      username: user.username,
      clientType,
      currentRefreshTokenId: tokens.refreshTokenId,
      expiresAt: Math.floor(Date.now() / 1000) + tokens.refreshExpiresIn,
    });

    const profile = this.authRepository.toProfile(user);

    if (clientType === AUTH_WEB_CLIENT_TYPE) {
      this.writeWebCookies(response, tokens.accessToken, tokens.refreshToken);

      return {
        expiresIn: tokens.accessExpiresIn,
        refreshExpiresIn: tokens.refreshExpiresIn,
        authMode: 'cookie',
        profile,
      };
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: tokens.accessExpiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      authMode: 'token',
      profile,
    };
  }

  async logout(
    payload: LogoutDto,
    request: Request,
    response: Response,
  ): Promise<{ success: true }> {
    const clientType = this.getClientType(request);

    if (clientType === AUTH_WEB_CLIENT_TYPE) {
      const refreshToken = this.tryExtractWebRefreshToken(request);

      if (refreshToken) {
        await this.revokeRefreshSession(refreshToken);
      }

      this.clearWebCookies(response);
      return { success: true };
    }

    if (payload.refreshToken) {
      await this.revokeRefreshSession(payload.refreshToken);
    }

    return { success: true };
  }

  async devRegister(
    payload: DevRegisterDto,
    request: Request,
  ): Promise<{ registered: true; profile: AuthProfile }> {
    const secret = request.headers[AUTH_DEV_REGISTER_SECRET_HEADER];
    const providedSecret =
      typeof secret === 'string'
        ? secret.trim()
        : Array.isArray(secret)
          ? secret[0]?.trim()
          : '';

    if (
      !providedSecret ||
      providedSecret !== process.env.AUTH_DEV_REGISTER_SECRET
    ) {
      throw new UnauthorizedException(
        'Invalid development registration secret',
      );
    }

    const user = await this.authRepository.registerDevUser({
      phone: payload.phone.trim(),
      passwordHash: this.authPasswordService.hashPassword(
        payload.password.trim(),
      ),
      nickname: payload.nickname?.trim(),
      email: payload.email?.trim(),
    });

    return {
      registered: true,
      profile: this.authRepository.toProfile(user),
    };
  }

  async getProfile(request: AuthenticatedRequest) {
    const authContext = request.authContext;

    if (!authContext) {
      throw new UnauthorizedException('Missing auth context');
    }

    const user = await this.authRepository.findUserById(authContext.userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.authRepository.toProfile(user);
  }

  async loginWechatMini(
    payload: WechatMiniLoginDto,
    request: Request,
  ): Promise<LoginResponseDto> {
    const clientType = this.getClientType(request);

    if (clientType !== AUTH_MINI_PROGRAM_CLIENT_TYPE) {
      throw new BadRequestException(
        'Wechat mini-program login only accepts x-client-type: mini-program',
      );
    }

    const { openid } = await this.wechatMiniAuthService.exchangeLoginCode(
      payload.code,
    );

    const user = await this.authRepository.upsertWechatMiniPhoneUser({
      openId: openid,
      phoneNumber: payload.phone.trim(),
    });

    if (user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.authRepository.ensureWebPasswordIdentity({
      userId: user.userId,
      phone: payload.phone.trim(),
      passwordHash: this.authPasswordService.hashPassword('123456'),
    });

    await this.authRepository.markUserLastLogin(user.userId);

    const tokens = this.authTokenService.issueTokens(user, clientType);
    await this.authSessionService.storeRefreshSession({
      sessionId: tokens.sessionId,
      userId: user.userId,
      username: user.username,
      clientType,
      currentRefreshTokenId: tokens.refreshTokenId,
      expiresAt: Math.floor(Date.now() / 1000) + tokens.refreshExpiresIn,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: tokens.accessExpiresIn,
      refreshExpiresIn: tokens.refreshExpiresIn,
      authMode: 'token',
      profile: this.authRepository.toProfile(user),
    };
  }

  getPublicRouteWhitelist(): string[] {
    return [
      'GET /',
      'POST /v1/auth/login',
      'POST /v1/auth/refresh',
      'POST /v1/auth/logout',
      'POST /v1/auth/dev-register',
      'POST /v1/auth/wechat-mini/login',
    ];
  }

  private writeWebCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    response.cookie(
      this.authTokenService.getAccessCookieName(),
      accessToken,
      this.authTokenService.buildCookieOptions(
        this.authTokenService.getAccessTokenTtlSeconds() * 1000,
      ),
    );
    response.cookie(
      this.authTokenService.getRefreshCookieName(),
      refreshToken,
      this.authTokenService.buildCookieOptions(
        this.authTokenService.getRefreshTokenTtlSeconds() * 1000,
      ),
    );
  }

  private clearWebCookies(response: Response): void {
    const options = this.authTokenService.buildClearCookieOptions();

    response.clearCookie(this.authTokenService.getAccessCookieName(), options);
    response.clearCookie(this.authTokenService.getRefreshCookieName(), options);
  }

  private extractMiniRefreshToken(refreshToken?: string): string {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return refreshToken.trim();
  }

  private tryExtractWebRefreshToken(request: Request): string | null {
    try {
      return this.authTokenService.extractRefreshTokenFromCookie(request);
    } catch {
      return null;
    }
  }

  private async revokeRefreshSession(refreshToken: string): Promise<void> {
    try {
      const payload = this.authTokenService.verifyRefreshToken(refreshToken);
      await this.authSessionService.clearRefreshSession(payload.sid);
    } catch {
      return;
    }
  }

  private getClientType(request: Request): AuthClientType {
    const rawValue = request.headers[AUTH_CLIENT_TYPE_HEADER];
    const clientType =
      typeof rawValue === 'string'
        ? rawValue.trim()
        : Array.isArray(rawValue)
          ? rawValue[0]?.trim()
          : AUTH_WEB_CLIENT_TYPE;

    if (!clientType) {
      return AUTH_WEB_CLIENT_TYPE;
    }

    if (
      SUPPORTED_AUTH_CLIENT_TYPES.includes(
        clientType as (typeof SUPPORTED_AUTH_CLIENT_TYPES)[number],
      )
    ) {
      return clientType as AuthClientType;
    }

    throw new BadRequestException(
      `Unsupported ${AUTH_CLIENT_TYPE_HEADER} header`,
    );
  }
}
