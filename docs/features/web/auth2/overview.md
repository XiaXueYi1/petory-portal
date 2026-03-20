# Web Auth2

## 目标

完成 Web 端 auth2 升级，围绕环境变量、class 形态请求层和 Cookie 认证闭环做最小可用落地，保证能够与后端新的 auth 模块继续联调。

## 当前范围

- 新增 `petory-web/.env.dev` 与 `petory-web/.env.prod`
- 把本轮涉及的 Web 配置迁移到环境变量
- 用 `axios` 重构请求层，统一走 class 形态 `http`
- 按 `accessToken + refreshToken` 双 Cookie 方案组织 Web 登录态
- 保留现有登录页和最小首页壳层，只调整 auth2 所需流程

## 当前实现

- Web 当前不自行持久化 bearer token
- 登录成功后由后端写入 Cookie
- 应用启动时由 `AuthBootstrap` 拉取 `/auth/profile`
- 请求层遇到 `401` 时会尝试调用 `/auth/refresh`，成功后重放原请求
- 若 refresh 失败或 profile 继续返回 `401`，前端清空登录态并回到匿名状态

## 本轮环境变量

- `VITE_APP_TITLE`
- `VITE_API_BASE_URL`
- `VITE_REQUEST_TIMEOUT`
- `VITE_AUTH_REFRESH_ENABLED`
- `VITE_AUTH_REFRESH_PATH`

## 未完成

- 还没有完整后台首页、菜单树和动态路由
- 还没有登录成功后的权限路由装配
- 还没有多标签页登录态同步
- 还没有对 refresh 失败做更细的全局提示
