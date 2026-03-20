import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WechatMiniLoginDto } from '@/modules/auth/dto';

interface WechatMiniSessionResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

interface WechatMiniAccessTokenResponse {
  access_token?: string;
  expires_in?: number;
  errcode?: number;
  errmsg?: string;
}

interface WechatMiniPhoneCodeResponse {
  phone_info?: {
    phoneNumber?: string;
    purePhoneNumber?: string;
    countryCode?: string;
  };
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WechatMiniAuthService {
  private cachedAccessToken: { token: string; expiresAt: number } | null = null;

  constructor(private readonly configService: ConfigService) {}

  async exchangeLoginAndPhoneCode(payload: WechatMiniLoginDto): Promise<{
    openid: string;
    phoneNumber: string;
  }> {
    const [session, phoneNumber] = await Promise.all([
      this.exchangeCodeForSession(payload.code),
      this.exchangePhoneCodeForPhoneNumber(payload.phoneCode),
    ]);

    return {
      openid: session.openid,
      phoneNumber,
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

  private async exchangePhoneCodeForPhoneNumber(
    phoneCode: string,
  ): Promise<string> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: phoneCode }),
      },
    );
    const payload = (await response.json()) as WechatMiniPhoneCodeResponse;

    this.assertWeChatResponseOk(payload.errcode, payload.errmsg);

    const phoneNumber =
      payload.phone_info?.purePhoneNumber ?? payload.phone_info?.phoneNumber;

    if (!phoneNumber) {
      throw new BadGatewayException('Missing phone number from WeChat');
    }

    return phoneNumber;
  }

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    if (this.cachedAccessToken && this.cachedAccessToken.expiresAt > now + 60) {
      return this.cachedAccessToken.token;
    }

    const url = new URL('https://api.weixin.qq.com/cgi-bin/token');
    url.searchParams.set('grant_type', 'client_credential');
    url.searchParams.set('appid', this.getRequiredConfig('WECHAT_MINI_APP_ID'));
    url.searchParams.set(
      'secret',
      this.getRequiredConfig('WECHAT_MINI_APP_SECRET'),
    );

    const response = await fetch(url);
    const payload = (await response.json()) as WechatMiniAccessTokenResponse;

    this.assertWeChatResponseOk(payload.errcode, payload.errmsg);

    if (!payload.access_token || !payload.expires_in) {
      throw new BadGatewayException('Missing WeChat access token');
    }

    this.cachedAccessToken = {
      token: payload.access_token,
      expiresAt: now + payload.expires_in,
    };

    return payload.access_token;
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
