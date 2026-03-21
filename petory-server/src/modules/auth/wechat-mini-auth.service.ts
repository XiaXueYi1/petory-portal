import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface WechatMiniSessionResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatMiniAuthService {
  constructor(private readonly configService: ConfigService) {}

  async exchangeLoginCode(code: string): Promise<{
    openid: string;
  }> {
    const session = await this.exchangeCodeForSession(code);

    return {
      openid: session.openid,
    };
  }

  private async exchangeCodeForSession(code: string): Promise<{
    openid: string;
    sessionKey: string;
    unionid?: string;
  }> {
    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.searchParams.set('appid', this.getRequiredConfig('WECHAT_MINI_APP_ID'));
    url.searchParams.set(
      'secret',
      this.getRequiredConfig('WECHAT_MINI_APP_SECRET'),
    );
    url.searchParams.set('js_code', code);
    url.searchParams.set('grant_type', 'authorization_code');

    const response = await fetch(url);
    const payload = (await response.json()) as WechatMiniSessionResponse;

    this.assertWeChatResponseOk(payload.errcode, payload.errmsg);

    if (!payload.openid || !payload.session_key) {
      throw new BadGatewayException('Missing WeChat mini-program session data');
    }

    return {
      openid: payload.openid,
      sessionKey: payload.session_key,
      unionid: payload.unionid,
    };
  }

  private assertWeChatResponseOk(errcode?: number, errmsg?: string): void {
    if (typeof errcode === 'number' && errcode !== 0) {
      throw new BadGatewayException(
        `WeChat API error ${errcode}: ${errmsg ?? 'unknown error'}`,
      );
    }
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new BadGatewayException(`Missing required config: ${key}`);
    }

    return value;
  }
}
