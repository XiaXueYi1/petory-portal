# WeChat Phone Login v3 Integration

## Login Flow

1. Page entry calls `Taro.login()` to get `loginCode`.
2. User taps WeChat phone button (`openType="getPhoneNumber"`).
3. Frontend reads `phoneCode` from the button event.
4. Frontend sends payload:

```json
{
  "loginCode": "wx-login-code",
  "phoneCode": "wx-phone-code",
  "clientType": "mini-program"
}
```

5. API: `POST /v1/auth/wechat-mini/login`
6. On success, frontend saves `accessToken` and future requests attach `Authorization: Bearer <token>`.

## Request Layer Contract

- Shared client: `miniHttp`
- Header injection: `x-client-type: mini-program`
- Login request uses `auth: false`
- Token persistence: `miniHttp.setToken(accessToken)`

## Env Contract (Official Taro)

- Env files: `.env.development`, `.env.production`
- Runtime key prefix: `TARO_APP_`
- Current state marker:
  - `TARO_APP_WECHAT_PHONE_LOGIN_STATUS=page-ready`

## Current Limits

- Depends on server-side implementation of `POST /v1/auth/wechat-mini/login`
- No business-page redirect after login in this round

