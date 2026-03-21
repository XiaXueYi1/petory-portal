# auth4 - Server Changelog

## 本轮新增

- 将 Web 登录主路径收敛为 `phone + password`
- 将 Mini 登录主路径收敛为 `phone + appCode(code)`
- Mini 登录接入 `code -> openid + session_key` 交换流程
- Mini 首次登录支持按 `phone + openid` 自动注册与绑定
- Mini access token 有效期延长到至少 7 天

## 本轮修改

- `login.dto` 从旧账号字段切换为手机号字段
- `wechat-mini-login.dto` 收敛为 `phone + code`
- `auth.service`、`auth.repository`、`wechat-mini-auth.service` 按新认证策略重组
- `dev-register` 改为手机号注册路径

## 数据与模型说明

- 本轮未修改 Prisma schema
- 继续复用：
  - `users.phone`
  - `user_auth_identities`
- `openid` 作为 Mini 长期绑定标识
- `appCode(code)` 不作为长期存储字段

## 已知限制

- Mini 当前默认登录方案不再依赖微信手机号一键授权
- Mini 当前不做 refresh token 页面逻辑
- 真实联调仍依赖正确的微信 `appid/secret` 与本地环境配置
