# Server Auth4 Fix API

## `POST /v1/auth/login`

### 用途

Web 登录，`phone + password`。

### 请求体

```json
{
  "phone": "13800138000",
  "password": "ciphertextBase64.authTagBase64"
}
```

### 说明

- 仅登录接口里的 `password` 字段按 AES-256-GCM 解密
- 开发环境固定 key 和 iv：
  - `AUTH_WEB_PASSWORD_AES_KEY_BASE64`
  - `AUTH_WEB_PASSWORD_AES_IV_BASE64`
- 解密后再做密码哈希比对

## `POST /v1/auth/wechat-mini/login`

### 用途

Mini 登录，`phone + appCode(code)`。

### 说明

- 首次自动注册时补齐 Web 可登录的手机号密码身份
- 默认密码为 `123456`

