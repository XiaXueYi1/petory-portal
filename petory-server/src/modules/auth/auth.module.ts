import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthPasswordService } from '@/modules/auth/auth-password.service';
import { AuthSessionService } from '@/modules/auth/auth-session.service';
import { AuthTokenService } from '@/modules/auth/auth-token.service';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthRepository } from '@/modules/auth/repository/auth.repository';
import { WechatMiniAuthService } from '@/modules/auth/wechat-mini-auth.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthPasswordService,
    AuthSessionService,
    AuthTokenService,
    AuthService,
    WechatMiniAuthService,
    AuthRepository,
  ],
  exports: [AuthService, AuthTokenService],
})
export class AuthModule {}
