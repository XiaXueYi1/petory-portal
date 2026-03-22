# Server Auth5 API

说明：以下路径均挂载在统一基础前缀 `/v1` 下。

## POST /auth/login

用途：

- Web 手机号密码登录

请求体：

```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

说明：

- `phone` 必填
- `password` 仍按当前登录契约处理
- 当前实现兼容 Web 登录密码明文和登录加密载荷

## POST /auth/wechat-mini/login

用途：

- Mini 手机号 + `appCode(code)` 登录

请求体：

```json
{
  "phone": "13800138000",
  "code": "wx-login-code"
}
```

处理流程：

1. 服务端使用 `code + appid + secret` 换取 `openid + session_key`
2. 按 `phone + openid` 查找或创建用户
3. 自动同步 `WEB_PASSWORD` 身份
4. 默认密码保持 `123456`
5. 返回 Bearer Token

## POST /auth/dev-register

用途：

- 开发阶段快速注册或重置本地账号

说明：

- 当前仍保持手机号注册
- Web 默认密码边界仍为 `123456`
