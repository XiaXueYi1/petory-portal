# Web Auth4

## 目标

完成 Web 端 auth4 登录调整，把登录表单从 `username + password` 收敛为 `phone + password`，并继续沿用当前 Cookie 认证闭环。

## 当前范围

- 将 `/login` 页面登录字段改为手机号
- 为手机号增加基础格式校验
- 保持请求层 `class HttpClient` 不变
- 保持 `x-client-type: web` 请求头约定不变
- 保持后端写 Cookie，前端通过 `/auth/profile` 同步登录态的模式不变
- 不扩展后台业务页、菜单树和动态路由

## 当前状态

- 登录页已切换到手机号密码表单
- 前端表单已增加手机号格式校验
- `auth` API 类型已从 `username` 改为 `phone`
- 登录请求仍通过现有 `http.post` 发起

## 已知限制

- 当前仅调整 Web 登录字段，不涉及服务端认证改造
- 仍然依赖后端 Cookie / Session 闭环可用
- 还没有完整后台首页、菜单树和权限路由装配
