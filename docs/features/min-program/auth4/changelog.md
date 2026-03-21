# Mini Program Auth4 Changelog

## 2026-03-21

### Added

- created `docs/features/min-program/auth4/overview.md`
- created `docs/features/min-program/auth4/integration.md`
- created `docs/features/min-program/auth4/changelog.md`

### Updated

- login page switched from one-tap phone authorization to phone input
- login button now fetches a fresh `Taro.login()` code at submit time
- login request payload changed to `phone + code`
- mini auth request types were updated to the auth4 shape
- env defaults now use `phone-appcode` as the strategy marker
- mini token behavior stays Bearer-based and long-lived
- Sass baseline remains unchanged
- docs now clarify that first mini auto-registration should also create a Web-login password identity
- current development default password is documented as `123456`

### Limits

- no refresh flow on the mini side
- no business-page redirect in this round
- the current login page is still a minimal debug page and should be replaced in `auth4-fix`
- historical `wechat-phone-login-v3` docs are preserved as reference material
- backend fields must remain aligned with the server auth4 thread

