# Server Auth5 Changelog

## 本轮修正

- 修复 mini 已注册用户 Web 登录失败的问题
- 将 `WEB_PASSWORD` 身份同步逻辑改为 upsert，避免旧身份阻塞默认密码修正
- 继续保持 Web `phone + password` 登录契约
- 继续保持 mini `phone + appCode(code)` 登录契约

## 数据说明

- 仍然不新增 Prisma schema
- 仍复用 `users` 与 `user_auth_identities`
- 默认密码仍为 `123456`

## 已知限制

- 当前不包含独立改密流程
- 当前不扩展 RBAC
- Web 密码传输加密仍依赖现有前端实现和环境变量一致性
