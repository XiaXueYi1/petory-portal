# Web Auth4 Integration

## 对接接口

- `POST /v1/auth/login`
- `GET /v1/auth/profile`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`

## 登录请求约定

当前 Web 登录页默认提交：

```json
{
  "phone": "13800000000",
  "password": "123456"
}
```

说明：

- 当前登录字段已经从 `username` 切换为 `phone`
- `phone` 需要通过前端基础手机号格式校验
- 当前 auth4 已合并代码仍按普通密码字段对接
- 后续 `auth4-fix` 推荐改为：仅对登录请求里的 `password` 提交前使用 `AES-256-GCM` 加密
- 服务端收到后使用同密钥解密，再与数据库中的密码哈希比对
- 请求层默认使用 `credentials: include`
- 请求头仍会自动补 `x-client-type: web`
- 因此后端若使用 Cookie / Session，应确保本地跨域策略与凭据策略一致
- `AES-256-GCM` 不替代 HTTPS，生产环境仍必须开启 HTTPS
- 推荐环境变量：
  - `VITE_AUTH_PASSWORD_AES_KEY_BASE64`
  - `AUTH_WEB_PASSWORD_AES_KEY_BASE64`
  - `VITE_AUTH_PASSWORD_AES_IV_BASE64`
  - `AUTH_WEB_PASSWORD_AES_IV_BASE64`
- 当前开发环境密钥：
  - `ciCsw/I6/PwLnqEbZTjt/igEKI3MuP4QTn1rQaWciMo=`
- 当前开发环境固定 `iv`：
  - `Ea4hK8529EyK70+w`
- 当前项目直接使用固定 key + 固定 iv，且只处理登录接口中的 `password`
- 对于 mini 首次自动注册生成的账号，当前开发阶段默认密码为 `123456`

## 页面时序

```txt
访问 /login
 -> 提交 phone + password，并在请求头附带 x-client-type: web
 -> POST /v1/auth/login
 -> 后端写入 accessToken / refreshToken Cookie
 -> 前端立即请求 GET /v1/auth/profile
 -> 写入 auth store
 -> 跳转到 /
```

## 错误处理

- 登录失败时展示接口返回的 `message`
- `profile` 返回 401 时清空登录态并回到匿名状态
- 非 401 的 `profile` 初始化失败目前只做最小清空处理，后续可补全局异常提示

## 当前限制

- 还未接入真实业务首页
- 还未根据 `menus / permissions` 动态生成路由
- 还未处理多标签页同步或登录态持久化增强
- 当前登录页仍偏调试态，后续 `auth4-fix` 需要替换为真实主题页并在成功后跳转首页
