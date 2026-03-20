import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthTokenService } from '../../modules/auth/auth-token.service';
import type { AuthenticatedRequest } from '../../modules/auth/auth.types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authTokenService: AuthTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.authTokenService.extractAccessToken(request);
    const payload = this.authTokenService.verifyAccessToken(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    request.authContext = {
      userId: payload.sub,
      username: payload.username,
      clientType: payload.clientType,
      sessionId: payload.sid,
      tokenType: 'access',
    };

    return true;
  }
}
