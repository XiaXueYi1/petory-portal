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
- 本轮页面仍以最小登录页为主，真实主题化登录页放到后续 `auth4-fix`

## 当前状态

- 登录页已切换到手机号密码表单
- 前端表单已增加手机号格式校验
- `auth` API 类型已从 `username` 改为 `phone`
- 登录请求仍通过现有 `http.post` 发起
- 登录接口中的 `password` 字段加解密放入后续 `auth4-fix`
- 当前约定方案为使用 `AES-256-GCM` 加密密码
- 开发环境共享密钥：`ciCsw/I6/PwLnqEbZTjt/igEKI3MuP4QTn1rQaWciMo=`
- 若用户来自 mini 首次自动注册，当前开发阶段可用默认密码 `123456` 登录 Web

## 已知限制

- 当前仅调整 Web 登录字段，不涉及服务端认证改造
- 仍然依赖后端 Cookie / Session 闭环可用
- 还没有完整后台首页、菜单树和权限路由装配
- `AES-256-GCM` 仅作为后续传输层补充保护，正式环境仍必须依赖 HTTPS
