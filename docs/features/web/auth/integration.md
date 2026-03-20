# Web Auth Integration

## 对接接口

- `POST /v1/auth/login`
- `GET /v1/auth/profile`
- `POST /v1/auth/logout`

## 登录请求约定

当前 Web 登录页默认提交：

```json
{
  "username": "admin",
  "password": "123456"
}
```

说明：

- 当前默认超级管理员账号仅用于本地开发联调
- 请求层默认使用 `credentials: include`
- 因此后端若使用 Cookie / Session，应确保本地跨域策略与凭据策略一致

## 页面时序

```txt
访问 /login
 -> 提交用户名密码
 -> POST /v1/auth/login
 -> 成功后写入 auth store
 -> 触发 /v1/auth/profile 校验与同步
 -> 跳转到 /
 -> 渲染临时首页占位
```

## 错误处理

- 登录失败时展示接口返回的 `message`
- `profile` 返回 401 时清空登录态并回到匿名状态
- 非 401 的 `profile` 初始化失败目前只做最小清空处理，后续可补全局异常提示

## 当前限制

- 还未接入真实业务首页
- 还未根据 `menus / permissions` 动态生成路由
- 还未处理多标签页同步或登录态持久化增强
