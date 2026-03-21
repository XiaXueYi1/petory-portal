# auth4 - Server API

统一基础前缀：`/v1`

## 通用请求头

- Web 登录请求：
  - `x-client-type: web`
- Mini 登录请求：
  - `x-client-type: mini-program`

## POST /v1/auth/login

### 用途

Web 管理端手机号密码登录。

### 请求体

```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

### 说明

- `phone` 必填，并按中国大陆手机号格式校验
- `password` 必填，并按当前 DTO 规则校验长度
- 登录成功后由服务端写入 Web 所需 Cookie

## POST /v1/auth/wechat-mini/login

### 用途

Mini 端手机号 + `appCode(code)` 登录。

### 请求体

```json
{
  "phone": "13800138000",
  "code": "wechat-login-code"
}
```

### 说明

- `phone` 必填，并按中国大陆手机号格式校验
- `code` 为小程序端通过 `wx.login()` 获取的临时凭证
- 服务端使用 `code + appid + secret` 换取 `openid + session_key`
- 首次登录时：
  - 若手机号未命中已绑定的 Mini 身份，则自动注册并绑定 `openid`
- 后续登录时：
  - 若手机号已命中绑定的 `openid`，则直接重新签发 Bearer Token

### 响应特征

- 返回 Mini 侧 Bearer Token 所需信息
- 当前 Mini 端使用长效 access token
- Mini 端当前不依赖 refresh token 页面逻辑

## POST /v1/auth/dev-register

### 用途

本地开发环境注册 Web 测试账号。

### 请求体

```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "Petory",
  "email": "dev@example.com"
}
```

### 说明

- 用于本地开发环境准备 Web 登录账号
- 本轮已从旧的用户名注册改为手机号注册
