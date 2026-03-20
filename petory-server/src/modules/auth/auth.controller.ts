import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../common';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  SESSION_COOKIE_NAME,
} from './auth.constants';
import type { LoginDto } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const loginResult = this.authService.login(payload);
    const clientType = payload.clientType ?? 'web';

    if (clientType === 'web') {
      response.cookie(SESSION_COOKIE_NAME, loginResult.accessToken ?? '', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
      });

      return {
        ...loginResult,
        accessToken: undefined,
        tokenType: undefined,
      };
    }

    return loginResult;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    return this.authService.logout();
  }

  @Get('profile')
  getProfile(@Req() request: Request) {
    return this.authService.getProfile(request);
  }
}
