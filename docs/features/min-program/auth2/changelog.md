# Mini Program Auth2 Changelog

## 2026-03-21

### Added

- created `mini-program/.env.dev`
- created `mini-program/.env.prod`
- added build-time env loader for mini-program config
- added runtime env access wrapper
- added class-shaped request client under `src/shared/request/`
- added mini auth2 docs

### Design decisions

- mini auth uses Bearer Token
- login requests do not attach a token
- the request client is class-based and built on `axios`
- the request surface is intentionally aligned with the web-side mental model
- first-stage phone-number login is design-defined and not yet platform-integrated

### Validation

- no build command was executed
- no dev server was started
- no extra runtime dependency was added beyond the request-layer need already reflected in `package.json`

### Known risks

- phone-number login integration is still pending
- no live API verification happened in this round
- backend token contract should be verified in the next integration round

