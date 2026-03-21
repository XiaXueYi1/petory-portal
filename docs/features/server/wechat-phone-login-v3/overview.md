# Wechat Phone Login V3 Overview

## 目标

本轮在 `petory-server/` 内补齐微信小程序手机号一键登录服务端闭环，保证 mini 端可以继续接入并完成 Bearer Token 登录。

## 本轮范围

- 保留 Web 双 Cookie 登录路径不变
- 新增 mini 小程序手机号一键登录的服务端实现
- 接入微信 `code -> openid + session_key`
- 接入微信手机号 `phoneCode -> phoneNumber`
- 根据手机号绑定或创建本地用户
- 继续使用 mini Bearer Token 作为登录返回方式
- 为 `petory-server/src` 统一接入 `@/*` 路径别名并替换长相对路径引用

## 当前结论

- `POST /v1/auth/wechat-mini/login` 已从预留接口变成真实登录接口
- 该接口现在要求 mini 端同时提供登录 `code` 和手机号 `phoneCode`
- 服务端会优先通过微信接口拿到 `openid` 和手机号码，再完成本地用户匹配或创建
- 登录成功后仍返回 `accessToken / refreshToken`，但以 Bearer Token 方式给 mini 端使用
- `petory-server` 已完成 `@/* -> src/*` 别名配置，模块导入路径已统一收敛

## 依赖前提

- `WECHAT_MINI_APP_ID`
- `WECHAT_MINI_APP_SECRET`
- 本地 PostgreSQL
- 本地 Redis

## 当前限制

- 如果微信平台真实参数无效，接口会直接返回失败
- 当前不做完整微信开放平台兜底或容错模拟
- 未扩展完整 RBAC 管理能力
- 合入 `master` 后需要把路径别名约束同步到主分支项目文档

## 已知联调问题

- 若 mini 端 `TARO_APP_ID` 与服务端 `.env` 中的 `WECHAT_MINI_APP_ID` 不一致，`jscode2session` 会直接返回 `40029 invalid code`
- `code` 是一次性短时凭证，失败重试时必须重新执行 `Taro.login()`
