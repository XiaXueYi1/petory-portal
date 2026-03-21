# Server Auth4 Overview

## 目标

完成 `petory-server/` 侧认证语义收口，正式支持：

- Web 走 `phone + password`
- Mini 走 `phone + appCode(code)`
- Web 继续使用 `accessToken + refreshToken` 双 Cookie
- Mini 继续使用 Bearer Token 方向，但 access token 采用长效策略，至少 7 天

## 当前范围

- 仅处理 `petory-server/` 的认证闭环
- 不扩展 RBAC 后台管理接口
- 不新增 Prisma schema
- 不引入数据库结构变更
- 不改主文档，主文档以现有 `master` 为准

## 已完成

- `POST /v1/auth/login` 已改为手机号密码登录
  - 请求字段改为 `phone + password`
  - 校验仍走 Nest DTO + `class-validator`
  - Web 登录成功后写入 Cookie
- `POST /v1/auth/wechat-mini/login` 已改为 `phone + appCode(code)` 登录
  - 服务端仅使用 `code + appid + secret` 兑换 `openid + session_key`
  - 不再依赖微信手机号授权接口
  - 首次登录按 `phone + openid` 匹配或自动注册
  - 绑定用户时默认随机昵称、空头像
  - 首次自动注册时同步补齐 Web 可登录的手机号密码身份
  - 当前开发阶段默认初始密码为 `123456`
- Mini access token 已改为长效策略
  - 当前实现按配置推导，至少 7 天
  - refresh token 仍保留在统一返回结构中，但 Mini 侧当前不依赖 refresh 流程
- 开发注册接口已改为手机号注册
  - 用于本地手动补测试账号
- Web 登录接口中的 `password` 字段加解密放入后续 `auth4-fix`
  - 当前约定方案为 `AES-256-GCM`
  - Web 与 Server 共享密钥：`ciCsw/I6/PwLnqEbZTjt/igEKI3MuP4QTn1rQaWciMo=`
  - Web 与 Server 共享固定 `iv`：`Ea4hK8529EyK70+w`
  - 服务端仅解密登录接口中的 `password` 字段后再做哈希密码比对

## 数据约束

- 当前不需要 Prisma schema 变更
- 现有结构已经能表达本轮 auth4 绑定关系：
  - `users.phone`
  - `user_auth_identities.provider`
  - `user_auth_identities.provider_user_id`
- 约定：
  - `WEB_PASSWORD` 绑定 `phone`
  - `WECHAT_MINI_PROGRAM` 绑定 `openid`
  - `appCode` 仅用于登录时临时兑换，不作为长期凭证入库
  - 自动注册 mini 用户时，应同步存在 `WEB_PASSWORD` 身份记录

## 已知限制

- Mini 仍保留 refresh token 能力，但客户端当前不强制使用
- 当前不做 RBAC 管理功能扩展
- 当前不引入微信手机号一键授权作为默认路径
- `AES-256-GCM` 仅作为后续传输层补充保护，正式环境仍需 HTTPS
