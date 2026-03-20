# Changelog

- 新增 `/login` 页面与最小登录表单
- 新增基础 auth 请求封装：
  - `POST /v1/auth/login`
  - `GET /v1/auth/profile`
  - `POST /v1/auth/logout`
- 新增 `zustand` 登录态 store
- 新增启动时 `profile` 拉取与同步
- 新增受保护根路由与登录成功后的临时首页占位
- 重写 `RootLayout`，从 foundation 展示页切到 auth 阶段的应用壳层
- 登录页默认对接本地开发管理员账号：
  - username: `admin`
  - password: `123456`
- 当前保持 Cookie / Session 方向，不扩展到完整后台页面与菜单系统
