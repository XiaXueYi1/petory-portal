# Server Auth4 API

说明：以下路径均挂载在统一基础前缀 `/v1` 下。

## Header 约定

### `x-client-type`

用于区分当前请求来自哪一端：

- `web`
- `mini-program`

说明：

- 登录、刷新、注销都使用这个 header 判定端类型
- 未传时默认按 `web` 处理

### `x-dev-register-secret`

仅 `POST /auth/dev-register` 使用。

- 值必须与服务端环境变量 `AUTH_DEV_REGISTER_SECRET` 一致

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

- Web 手机号密码登录

请求头示例：

```http
x-client-type: web
```

请求体：

```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

字段约束：

- `phone`: 必填，11 位中国大陆手机号
- `password`: 必填，长度 `6-128`

Web 响应：

- 写入 HttpOnly Cookie：
  - `pt_access_token`
  - `pt_refresh_token`
- body：

```json
{
  "expiresIn": 900,
  "refreshExpiresIn": 604800,
  "authMode": "cookie",
  "profile": {
    "user": {
      "id": "uuid",
      "username": "13800138000",
      "nickname": "admin",
      "avatar": "",
      "email": null,
      "phone": "13800138000"
    },
    "roles": [],
    "permissions": [],
    "menus": []
  }
}
```

Mini 响应：

- 保持统一 token 返回结构
- 当前 Mini 登录主路径不走这里

错误：

- `400`: DTO 校验失败
- `401`: 手机号或密码错误

## `POST /auth/wechat-mini/login`

用途：

- Mini 手机号 + appCode(code) 登录
- 个人主体场景下，不再走微信手机号授权一键登录

请求头示例：

```http
x-client-type: mini-program
```

请求体：

```json
{
  "phone": "13800138000",
  "code": "wx-login-code"
}
```

字段约束：

- `phone`: 必填，11 位中国大陆手机号
- `code`: 必填，`wx.login()` 返回的 code

处理流程：

1. 服务端使用 `code + appid + secret` 换取 `openid + session_key`
2. 按 `phone + openid` 查找或创建用户
3. 首次登录自动注册用户
4. 默认随机昵称、空头像
5. 绑定成功后签发 Bearer Token

Mini 响应：

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "refreshExpiresIn": 604800,
  "authMode": "token",
  "profile": {
    "user": {
      "id": "uuid",
      "username": "13800138000",
      "nickname": "WeChat UserA1B2",
      "avatar": "",
      "email": null,
      "phone": "13800138000"
    },
    "roles": [],
    "permissions": [],
    "menus": []
  }
}
```

说明：

- `accessToken` 是 Mini 侧的主要鉴权凭证
- `refreshToken` 当前保留在统一响应结构中，但 Mini 客户端不强制依赖 refresh 流程
- `appCode` 不作为长期凭证入库，长期绑定标识是 `openid`

错误：

- `400`: DTO 校验失败
- `401`: 账号不可用或绑定失败
- `502`: 微信平台换码失败

## `POST /auth/refresh`

用途：

- Web 无感刷新 access token
- Mini 保留统一接口，但当前客户端不依赖 refresh

Web 请求：

- header: `x-client-type: web`
- refresh token 从 Cookie `pt_refresh_token` 读取

Mini 请求：

```json
{
  "refreshToken": "jwt"
}
```

响应：

- Web：重写 `pt_access_token` 与 `pt_refresh_token`
- Mini：返回新的 `accessToken` 与 `refreshToken`

## `POST /auth/logout`

用途：

- Web 清理 Cookie 并尝试回收 refresh session
- Mini 根据 body 中的 refresh token 尝试回收 refresh session

## `POST /auth/dev-register`

用途：

- 开发阶段快速注册或重置本地账号

请求头：

```http
x-dev-register-secret: petory-auth2-dev-register
```

请求体：

```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "Super Admin",
  "email": "admin@local.petory.dev"
}
```

字段约束：

- `phone`: 必填，11 位中国大陆手机号
- `password`: 必填，长度 `6-128`
- `nickname`: 可选，长度 `1-64`
- `email`: 可选，邮箱格式

## `GET /auth/profile`

用途：

- 获取当前登录用户 profile

鉴权：

- Web：读取 access token Cookie
- Mini：读取 `Authorization: Bearer <accessToken>`

## `GET /auth/public-routes`

用途：

- 返回当前白名单接口列表
