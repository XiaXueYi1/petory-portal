# Server Auth4 Changelog

## 本轮变更

- `POST /v1/auth/login`
  - 从 `username + password` 改为 `phone + password`
  - Web 继续走 Cookie 登录态
- `POST /v1/auth/wechat-mini/login`
  - 从微信手机号授权路径收口为 `phone + appCode(code)`
  - 服务端仅兑换 `openid + session_key`
  - 首次登录按 `phone + openid` 自动注册或绑定
  - 不再依赖 `getuserphonenumber`
  - 自动注册时同步补齐 Web 默认密码身份
- `POST /v1/auth/dev-register`
  - 改为手机号注册
- `AuthRepository`
  - Web 登录按手机号查找身份
  - Mini 首次登录按手机号与 openid 绑定
  - Mini 首次注册默认随机昵称、空头像
- `AuthTokenService`
  - Mini access token 改为长效策略，至少 7 天
  - Web 继续保持短期 access token + refresh token Cookie 方案
- Web 登录链路补充了后续 `auth4-fix` 的推荐方案：仅对登录接口中的 `password` 做 `AES-256-GCM` 加密 -> 同密钥解密 -> 哈希比对

## 数据约束

- 本轮没有新增 Prisma schema 文件
- 现有 `users` / `user_auth_identities` 已能承载 auth4 绑定关系
- `appCode` 仅用于登录时临时兑换，不入库
- `openid` 作为 Mini 侧长期绑定标识

## 已知限制

- Mini 仍保留 refresh token 能力，但当前客户端不强制使用
- 本轮不扩展 RBAC 管理后台
- 本轮不引入微信手机号一键授权作为默认路径
- 默认密码 `123456` 仅限当前开发阶段，后续应补首次改密或显式重置流程
