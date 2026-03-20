import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthPasswordService } from './auth-password.service';
import { AuthSessionService } from './auth-session.service';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';
import { AuthRepository } from './repository/auth.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthPasswordService,
    AuthSessionService,
    AuthTokenService,
    AuthService,
    AuthRepository,
  ],
  exports: [AuthService, AuthTokenService],
})
export class AuthModule {}
