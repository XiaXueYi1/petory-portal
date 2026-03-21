# Web Auth4 Fix Integration

## 登录请求

- `POST /v1/auth/login`
- `GET /v1/auth/profile`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

## 交互流程

1. 用户输入手机号和密码。
2. 前端仅对 `password` 使用 `AES-256-GCM` 加密。
3. 前端提交 `phone + encrypted password`。
4. 后端解密后做密码哈希比对。
5. 登录成功后写入 Cookie。
6. 前端拉取 `/v1/auth/profile`。
7. 跳转首页。

## 环境变量

- `VITE_AUTH_PASSWORD_AES_KEY_BASE64`
- `VITE_AUTH_PASSWORD_AES_IV_BASE64`
- `dev` 和 `prod` 环境都应保持同样的值
- `VITE_API_BASE_URL=/api`

## 本地代理

- Vite dev server 将 `/api` 代理到 `http://localhost:3000`
- 代理会把路径重写到 `/v1`

## 当前约定

- 固定 key 和固定 iv 仅用于当前开发基线
- 请求层仍保持 `credentials: include`
- 认证失败仍按现有 `ApiError` 处理
