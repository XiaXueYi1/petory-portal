# Wechat Phone Login V3 API

说明：以下路径均挂载在统一基础前缀 `/v1` 下。

## `POST /auth/wechat-mini/login`

用途：

- 微信小程序手机号一键登录
- 当前是 mini 端主登录入口

请求头：

```http
x-client-type: mini-program
```

请求体：

```json
{
  "code": "wx-login-code",
  "phoneCode": "phone-code-from-getPhoneNumber"
}
```

字段约束：

- `code`: 必填，长度 `1-512`
- `phoneCode`: 必填，长度 `1-512`

处理流程：

1. 后端用 `code + WECHAT_MINI_APP_ID + WECHAT_MINI_APP_SECRET` 换取 `openid + session_key`
2. 后端用 `phoneCode` 向微信换取手机号
3. 后端按 `openid` 或手机号匹配本地用户
4. 若本地没有对应用户则创建用户
5. 后端签发 mini Bearer Token

响应：

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
      "username": "13800000000",
      "nickname": "WeChat User0000",
      "avatar": "",
      "email": null,
      "phone": "13800000000"
    },
    "roles": [],
    "permissions": [],
    "menus": []
  }
}
```

错误：

- `400`: DTO 校验失败，或 `x-client-type` 不是 `mini-program`
- `401`: 微信 code / phoneCode 无效，或用户状态异常
- `502`: 微信平台返回错误或响应缺失关键字段

## 兼容说明

- 该轮没有修改 Web `accessToken + refreshToken` Cookie 流程
- `POST /auth/login` 的 Web / Mini 既有能力仍保留
- 本轮新能力专门面向微信手机号一键登录
