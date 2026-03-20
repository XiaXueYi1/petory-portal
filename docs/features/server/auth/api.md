# Server Auth API

## `POST /v1/auth/login`

用途：

- 使用默认超级管理员账号完成 Web 登录

请求体：

```json
{
  "username": "admin",
  "password": "123456",
  "clientType": "web"
}
```

响应体中的 `data`：

```json
{
  "expiresIn": 28800,
  "authMode": "cookie",
  "profile": {
    "user": {
      "id": "user-admin-local",
      "username": "admin",
      "nickname": "超级管理员",
      "avatar": "",
      "email": "admin@local.petory.dev"
    },
    "roles": ["admin"],
    "permissions": ["auth:login", "auth:profile", "system:read", "users:manage"],
    "menus": [
      {
        "id": "menu-system-dashboard",
        "parentId": null,
        "code": "system-dashboard",
        "name": "系统首页",
        "path": "/",
        "componentKey": "DashboardPage",
        "permissionCode": "system:read",
        "children": []
      }
    ]
  }
}
```

补充说明：

- 当 `clientType=web` 时，后端通过 `Set-Cookie` 写入 `pt_access_token`
- Web 后续请求无需自行拼 Bearer Token
- 当 `clientType=mini-program` 时，响应中预留返回 `accessToken` 与 `tokenType`

## `POST /v1/auth/logout`

用途：

- 提供前后端分离登录流程下的登出确认接口

响应体中的 `data`：

```json
{
  "success": true
}
```

说明：

- 当前阶段为无状态 token 方案，服务端不维护 token 黑名单
- Web 登出会清理 `pt_access_token` Cookie

## `GET /v1/auth/profile`

用途：

- 获取当前登录用户 profile

Web 请求方式：

```txt
Cookie: pt_access_token=<token>
```

小程序预留方式：

```txt
Authorization: Bearer <accessToken>
```

响应体中的 `data`：

- 返回结构与 `login` 中的 `profile` 一致

## 错误说明

- 缺少用户名或密码：`401`
- 用户名或密码错误：`401`
- 缺少登录 token：`401`
- Token 格式、签名或声明无效：`401`
- Token 已过期：`401`
