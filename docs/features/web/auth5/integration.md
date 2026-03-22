# Web Auth5 Integration

## 请求流程

1. 用户在登录页输入手机号和密码。
2. 前端对登录请求里的 `password` 做 `AES-256-GCM` 加密。
3. 前端提交 `phone + password` 到 `/v1/auth/login`。
4. 服务端返回登录结果并写入 Cookie。
5. 前端请求 `/v1/auth/profile`。
6. profile 成功后写入 auth store 并跳转首页。

## 请求约定

- 请求头继续使用 `x-client-type: web`
- 请求层保持 `credentials: include`
- 只加密登录请求里的 `password`
- 其他请求不做额外加密

## 环境变量

- `VITE_AUTH_PASSWORD_AES_KEY_BASE64`
- `VITE_AUTH_PASSWORD_AES_IV_BASE64`

开发基线值：

- `VITE_AUTH_PASSWORD_AES_KEY_BASE64=ciCsw/I6/PwLnqEbZTjt/igEKI3MuP4QTn1rQaWciMo=`
- `VITE_AUTH_PASSWORD_AES_IV_BASE64=Ea4hK8529EyK70+w`

## 已知限制

- 页面仍依赖后端 cookie 登录闭环
- 目前首页是最小承接页，后续再扩展业务模块
