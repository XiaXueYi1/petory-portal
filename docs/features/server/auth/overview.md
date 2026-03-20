# Server Auth

## 目标

完成 `petory-server/` 的最小可用认证闭环，确保 Web 端可以使用默认超级管理员账号完成登录并获取当前用户 profile。

## 当前范围

- 仅处理服务端 `auth` 基础能力
- 支持 Web 登录、登出和获取当前用户 profile
- 后端统一基础前缀使用 `/v1`
- 当前不接入数据库、Redis、RBAC 持久化或真实菜单配置后台

## 本轮产出

- 新增 `src/modules/auth/` 模块
- 提供 `POST /v1/auth/login`
- 提供 `POST /v1/auth/logout`
- 提供 `GET /v1/auth/profile`
- 使用内存态仓储承载默认超级管理员
- Web 登录成功由后端通过 `Set-Cookie` 写入登录 token
- 预留 `clientType` 区分：Web 走 Cookie，小程序走 Token
- `profile` 优先从 Cookie 读取当前登录态，同时兼容后续小程序 Bearer Token
- 入口接入 `/v1` 全局前缀、统一响应包装和全局异常处理

## 默认登录方式

- Username: `admin`
- Password: `123456`

## 当前状态

- 当前 auth 为最小本地开发实现，不依赖数据库
- JWT 为当前本地开发阶段的 token 载体，但 Web 不直接以 Bearer 方式使用
- 当前只保证 Web 登录闭环，不展开 RBAC 管理后台能力

## 已知限制

- 当前没有真实用户表、密码哈希和持久化 token 黑名单
- 当前菜单、权限和角色为内存态固定返回
- 当前 `logout` 会清理 Web Cookie，但服务端不做 token 吊销
