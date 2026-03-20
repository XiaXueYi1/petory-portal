# auth2 server API

说明：以下路径均挂载在统一基础前缀 `/v1` 下。

## Header 约定

### `x-client-type`

用于声明当前请求来自哪一端：

- `web`
- `mini-program`

说明：

- 登录、刷新、注销都使用这个 header 判定端类型
- 未传时默认按 `web` 处理

### `x-dev-register-secret`

仅 `POST /auth/dev-register` 使用。

- 值必须与服务端环境变量 `AUTH_DEV_REGISTER_SECRET` 一致
- 当前仅用于开发阶段注册 / 重置本地账号

## 白名单接口

以下接口不做 token 校验：

- `GET /`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/dev-register`
- `GET /auth/public-routes`
- `POST /auth/wechat-mini/login`

## `POST /auth/login`

用途：

- Web 用户名密码登录
- Mini 开发阶段用户名密码登录兼容

请求头示例：

```http
x-client-type: web
```

请求体：

```json
{
  "username": "admin",
  "password": "123456"
}
```

字段约束：

- `username`: 必填，长度 `3-64`
- `password`: 必填，长度 `6-128`

Web 响应：

- 写入 HttpOnly Cookie：
  - `pt_access_token`
  - `pt_refresh_token`
- body:

```json
{
  "expiresIn": 900,
  "refreshExpiresIn": 604800,
  "authMode": "cookie",
  "profile": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "nickname": "admin",
      "avatar": "",
      "email": null,
      "phone": null
    },
    "roles": [],
    "permissions": [],
    "menus": []
  }
}
```

Mini 响应：

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "refreshExpiresIn": 604800,
  "authMode": "token",
  "profile": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "nickname": "admin",
      "avatar": "",
      "email": null,
      "phone": null
    },
    "roles": [],
    "permissions": [],
    "menus": []
  }
}
```

错误：

- `400`: DTO 校验失败
- `401`: 用户名或密码错误

## `POST /auth/refresh`

用途：

- Web 无感刷新 access token
- Mini Bearer 方向刷新

Web 请求：

- header: `x-client-type: web`
- body 可为空 `{}`
- refresh token 从 Cookie `pt_refresh_token` 读取

Mini 请求：

- header: `x-client-type: mini-program`

```json
{
  "refreshToken": "jwt"
}
```

响应：

- Web：
  - 重写 `pt_access_token` 与 `pt_refresh_token`
  - body 返回 `authMode=cookie`、`expiresIn`、`refreshExpiresIn`、`profile`
- Mini：
  - body 返回新的 `accessToken` 与 `refreshToken`

错误：

- `400`: DTO 校验失败
- `401`: refresh token 无效、过期或 Redis session 不匹配

## `POST /auth/logout`

用途：

- Web 清理 Cookie 并尝试回收 refresh session
- Mini 根据 body 中的 refresh token 尝试回收 refresh session

Web 请求：

- header: `x-client-type: web`
- body 可为空 `{}`

Mini 请求：

- header: `x-client-type: mini-program`

```json
{
  "refreshToken": "jwt"
}
```

响应：

```json
{
  "success": true
}
```

## `POST /auth/dev-register`

用途：

- 开发阶段快速注册或重置本地账号
- 可用于手动注册 `admin`

请求头：

```http
x-dev-register-secret: petory-auth2-dev-register
```

请求体：

```json
{
  "username": "admin",
  "password": "123456",
  "nickname": "Super Admin",
  "email": "admin@local.petory.dev"
}
```

字段约束：

- `username`: 必填，长度 `3-64`
- `password`: 必填，长度 `6-128`
- `nickname`: 可选，长度 `1-64`
- `email`: 可选，邮箱格式

响应：

```json
{
  "registered": true,
  "profile": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "nickname": "Super Admin",
      "avatar": "",
      "email": "admin@local.petory.dev",
      "phone": null
    },
    "roles": [],
    "permissions": [],
    "menus": []
  }
}
```

说明：

- 如果用户名已存在，会更新密码哈希
- 当前不再自动补角色、权限、菜单

## `GET /auth/profile`

用途：

- 获取当前登录用户初始化信息

鉴权：

- Web：读取 access token Cookie
- Mini：读取 `Authorization: Bearer <accessToken>`

响应：

- 返回 `user / roles / permissions / menus`
- 当前以数据库真实结果为准，可能出现空数组

错误：

- `401`: access token 缺失、无效、过期，或用户不存在/已禁用

## `GET /auth/public-routes`

用途：

- 返回当前白名单接口列表

## `POST /auth/wechat-mini/login`

用途：

- 预留微信小程序手机号一键登录接口骨架

请求体：

```json
{
  "code": "wx-login-code"
}
```

当前状态：

- 接口存在
- 当前返回 `NotImplemented`
- 本轮未完成真实微信联调
