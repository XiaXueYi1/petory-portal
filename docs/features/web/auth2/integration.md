# Web Auth2 Integration

## 认证策略

- Web 使用 `accessToken + refreshToken` 双 Cookie
- `accessToken` 只负责接口鉴权
- `refreshToken` 不参与业务接口鉴权，只用于无感刷新
- 前端不在 `localStorage`、`sessionStorage` 或内存单独持久化 bearer token

## 环境变量约定

`.env.dev`

```env
VITE_APP_TITLE=Petory Portal
VITE_API_BASE_URL=http://localhost:3000/v1
VITE_REQUEST_TIMEOUT=10000
VITE_AUTH_REFRESH_ENABLED=true
VITE_AUTH_REFRESH_PATH=/auth/refresh
```

`.env.prod`

- 先保留占位
- 正式环境发布前再填真实域名和配置

## 对接接口

- `POST /v1/auth/login`
- `GET /v1/auth/profile`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

## 登录时序

```txt
访问 /login
 -> 提交 username + password，并在请求头附带 x-client-type: web
 -> POST /v1/auth/login
 -> 后端写入 accessToken / refreshToken Cookie
 -> 前端立即请求 GET /v1/auth/profile
 -> 写入 auth store
 -> 跳转到 /
```

## 启动时序

```txt
应用启动
 -> AuthBootstrap 请求 GET /v1/auth/profile
 -> accessToken 有效：直接返回 profile
 -> accessToken 失效且 refresh 可用：请求层自动 POST /v1/auth/refresh
 -> refresh 成功后自动重放原始请求
 -> profile 成功则进入 authenticated
 -> refresh 或 profile 失败则进入 anonymous
```

## Request 设计

- 统一入口：`src/shared/lib/request/client.ts`
- 对外暴露 class 实例：`http`
- 使用方式统一为对象参数：

```ts
http.get<UserProfile>({
  url: '/auth/profile',
})

http.post<LoginResult>({
  url: '/auth/login',
  payload,
  options: {
    headers: {
      'X-Trace-Id': 'debug',
    },
  },
})
```

- 默认配置：
  - `baseURL` 来自 `VITE_API_BASE_URL`
  - `withCredentials: true`
  - `timeout` 来自 `VITE_REQUEST_TIMEOUT`
- 默认能力：
  - 自动解包后端响应 envelope
  - 统一转成 `ApiError`
  - 401 时自动触发一次 refresh
  - refresh 期间并发请求复用同一个 refresh promise，避免重复刷新
  - 所有请求都可通过 `options.signal` 取消
  - `http.createAbortController()` 可直接创建取消控制器

## 取消请求示例

```ts
const controller = http.createAbortController()

http.get<UserProfile>({
  url: '/auth/profile',
  options: {
    signal: controller.signal,
  },
})

controller.abort()
```

## 已知对接前提

- 后端必须允许带凭据的跨域请求
- 后端需要按 Web 方案返回并刷新 Cookie
- refresh 接口路径当前按 `/auth/refresh` 约定，如后端改动需同步环境变量

