# WeChat Phone Login v3 Overview

## Goal

Build a minimal mini-program login baseline that supports only WeChat phone-number one-tap login.

## Scope in This Round

- Keep only one login entry: WeChat phone-number one-tap login
- Get WeChat login code from `Taro.login()`
- Submit phone auth code to server login API
- Persist `accessToken` into mini request layer
- Keep Sass as styling baseline
- Fetch a fresh `Taro.login()` code right before submit instead of caching it on page entry

## Env Mode (Official Taro)

The mini app now uses Taro official env-mode config:

- `.env.development`
- `.env.production`
- optional local overlays: `.env.local`, `.env.development.local`, `.env.production.local`

Runtime custom env keys use `TARO_APP_` prefix:

- `TARO_APP_API_BASE_URL`
- `TARO_APP_AUTH_TOKEN_KEY`
- `TARO_APP_AUTH_HEADER_NAME`
- `TARO_APP_AUTH_HEADER_PREFIX`
- `TARO_APP_REQUEST_TIMEOUT`
- `TARO_APP_LOGIN_STRATEGY`
- `TARO_APP_WECHAT_PHONE_LOGIN_STATUS`

## Dependency Result

- No new dependency added for this task
- Existing `axios` + `sass` are enough

## Not Done Yet

- No real WeChat platform e2e verification yet
- No post-login business home page yet

## Runtime Notes

- `getPhoneNumber` must return a real `phoneCode`; if the callback does not provide one, frontend should stop locally before calling the server
- `phoneCode` may be empty when the user denies authorization or when the current test environment does not provide real phone-number capability
- `code` from `Taro.login()` is a short-lived one-time credential and should be refreshed before each submit

