# Changelog

- 新增 `src/modules/auth/` 最小认证模块
- 新增内存态 `AuthRepository`，承载默认超级管理员
- 默认超级管理员账号固定为 `admin / 123456`
- 新增 `POST /v1/auth/login`
- 新增 `POST /v1/auth/logout`
- 新增 `GET /v1/auth/profile`
- 登录成功按 `clientType` 区分登录策略：Web 写 Cookie，小程序预留 Token 分支
- Web 端登录 cookie 名称固定为 `pt_access_token`
- `profile` 优先从 Cookie 读取登录态，同时兼容后续小程序 Bearer Token
- `main.ts` 接入 `/v1` 全局前缀
- `main.ts` 接入统一响应包装和全局异常处理
- 当前未接入数据库、密码哈希、Redis 或 token 黑名单
- 当前权限、角色与菜单为内存态固定返回
