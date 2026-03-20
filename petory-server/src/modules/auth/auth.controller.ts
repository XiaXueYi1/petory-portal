import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../common';
import {
  DevRegisterDto,
  LoginDto,
  LogoutDto,
  RefreshDto,
  WechatMiniLoginDto,
} from './dto';
import { AuthService } from './auth.service';
import type { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(
    @Body() payload: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(payload, request, response);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(
    @Body() payload: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(payload, request, response);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(
    @Body() payload: LogoutDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(payload, request, response);
  }

  @Public()
  @Post('dev-register')
  @HttpCode(200)
  devRegister(@Body() payload: DevRegisterDto, @Req() request: Request) {
    return this.authService.devRegister(payload, request);
  }

  @Public()
  @Get('public-routes')
  getPublicRoutes() {
    return this.authService.getPublicRouteWhitelist();
  }

  @Public()
  @Post('wechat-mini/login')
  @HttpCode(200)
  loginWechatMini(@Body() payload: WechatMiniLoginDto) {
    return this.authService.loginWechatMini(payload);
  }

  @Get('profile')
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.authService.getProfile(request);
  }
}
