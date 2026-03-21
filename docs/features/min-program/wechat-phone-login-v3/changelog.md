# WeChat Phone Login v3 Changelog

## Added

- Dedicated mini login page (`pages/login`)
- Mini auth feature API (`src/features/auth/api.ts`)
- Login payload/response types (`src/features/auth/index.ts`)
- WeChat phone one-tap login interaction flow

## Updated

- Switched mini env config to official Taro env-mode scheme
- Replaced custom env loader in `mini-program/config/index.ts`
- Runtime env access now uses `TARO_APP_*` keys
- Removed legacy `.env.dev` and `.env.prod`
- Keep Sass baseline, no Tailwind CSS introduced
- Simplified login flow to fetch a fresh `Taro.login()` code at submit time
- Added clearer local handling for missing WeChat phone authorization code

## Known Limits

- Real WeChat platform e2e verification is still pending
- No post-login landing page in this round

