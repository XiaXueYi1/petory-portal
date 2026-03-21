# WeChat Phone Login v3 Integration

## Login Flow

1. Page entry calls `Taro.login()` to get `code`.
2. User taps WeChat phone button (`openType="getPhoneNumber"`).
3. Frontend reads `phoneCode` from the button event.
4. Frontend sends payload:

```json
{
  "code": "wx-login-code",
  "phoneCode": "wx-phone-code"
}
```

5. API: `POST /v1/auth/wechat-mini/login`
6. On success, frontend saves `accessToken` and future requests attach `Authorization: Bearer <token>`.
7. If the `getPhoneNumber` callback does not provide `phoneCode`, frontend stops locally and treats it as an authorization/environment issue before calling server.

## Request Layer Contract

- Shared client: `miniHttp`
- Header injection: `x-client-type: mini-program`
- Login request uses `auth: false`
- Token persistence: `miniHttp.setToken(accessToken)`
- Frontend should get a fresh `Taro.login()` code before each submit, avoiding retries with a stale code

## Env Contract (Official Taro)

- Env files: `.env.development`, `.env.production`
- Runtime key prefix: `TARO_APP_`
- Current state marker:
  - `TARO_APP_WECHAT_PHONE_LOGIN_STATUS=page-ready`

## Current Limits

- Depends on server-side implementation of `POST /v1/auth/wechat-mini/login`
- No business-page redirect after login in this round
- `TARO_APP_ID` on the mini side must correspond to the same WeChat mini app as server-side `WECHAT_MINI_APP_ID`, otherwise WeChat may return `40029 invalid code`
- Real phone login capability still depends on WeChat actually returning a usable `phoneCode`

