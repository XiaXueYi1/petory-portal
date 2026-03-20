import { Injectable } from '@nestjs/common';
import { RedisService } from '@/infra/cache';
import type { RefreshSessionRecord } from '@/modules/auth/auth.types';
import { AuthTokenService } from '@/modules/auth/auth-token.service';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async storeRefreshSession(session: RefreshSessionRecord): Promise<void> {
    const ttlSeconds = Math.max(
      1,
      session.expiresAt - Math.floor(Date.now() / 1000),
    );

    await this.redisService.setJson(
      this.authTokenService.getRefreshSessionKey(session.sessionId),
      session,
      ttlSeconds,
    );
  }

  async getRefreshSession(
    sessionId: string,
  ): Promise<RefreshSessionRecord | null> {
    return this.redisService.getJson<RefreshSessionRecord>(
      this.authTokenService.getRefreshSessionKey(sessionId),
    );
  }

  async clearRefreshSession(sessionId: string): Promise<void> {
    await this.redisService.del(
      this.authTokenService.getRefreshSessionKey(sessionId),
    );
  }
}
