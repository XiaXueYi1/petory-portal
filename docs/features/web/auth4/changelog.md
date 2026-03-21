# Web Auth4 Changelog

- 登录页登录字段从 `username + password` 调整为 `phone + password`
- 登录表单新增手机号格式校验与 `tel` 输入语义
- `auth` API 类型中的登录字段从 `username` 改为 `phone`
- 登录请求仍沿用现有 class 形态请求层，不重写 request 架构
- 请求头继续自动注入 `x-client-type: web`
- Web 仍保持 Cookie 认证闭环和 `/auth/profile` 启动同步流程不变
- 新增 `docs/features/web/auth4/` 目录下的本轮说明文档

## 已知限制

- 本轮只做 Web 登录字段迁移，不涉及服务端认证改造
- 还未补完整后台业务页、菜单树和权限路由
- 仍然依赖后端 Cookie / Session 闭环可用
