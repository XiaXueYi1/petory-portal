# auth2 server 概览

## 本轮目标

在 `petory-server/` 内把认证能力从 auth 1.0 升级到 auth 2.0，重点落地：

- 环境变量化配置
- Web `accessToken + refreshToken` 双 Cookie
- Mini Bearer Token 兼容结构
- `x-client-type` 请求头识别端类型
- DTO 参数校验与全局 `ValidationPipe`
- Prisma + PostgreSQL 真实接入
- Redis 刷新会话最小落地
- 开发专用注册入口

## 已完成

- 新增 `petory-server/.env.dev` 与 `petory-server/.env.prod`
  - `.env.dev` 已补齐本轮 auth2 需要的配置
  - `.env.prod` 当前仅保留占位，尚未填入正式环境值
- `ConfigModule` 已接入，服务启动时默认读取：
  - 开发环境：`.env.dev`
  - 生产环境：`.env.prod`
- `start` / `start:dev` / `start:debug` / `start:prod` 已在启动前自动执行 Prisma client 生成，避免新环境因 `pnpm install` 跳过构建脚本而缺少 `@prisma/client`
- `main.ts` 已启用全局 `ValidationPipe`
- 登录 / 刷新 / 注销相关 DTO 已改为 `class-validator / class-transformer` 校验
- `AuthGuard` 已改为真实鉴权 Guard
  - 读取 `@Public()`
  - Web 优先从 Cookie 读取 access token
  - Mini / 其他 Bearer 请求从 `Authorization` 读取 access token
- 端类型不再从 body 读取，统一从请求头 `x-client-type` 读取
  - 支持：`web` / `mini-program`
  - 未传时默认按 `web` 处理
- 密码已改为真实哈希校验
  - 使用 Node 内置 `crypto.scryptSync`
  - 使用环境变量 `AUTH_PASSWORD_PEPPER`
- Prisma 已接入并按项目约束组织
  - 主 `prisma/schema.prisma` 仅保留 `generator / datasource / public enums`
  - 模型已拆为：
    - `prisma/schemas/users.prisma`
    - `prisma/schemas/roles.prisma`
    - `prisma/schemas/permissions.prisma`
    - `prisma/schemas/menus.prisma`
- 本地 PostgreSQL 已完成 `prisma db push`
- Redis 已接入，当前用于刷新令牌会话存储
  - key 前缀：`petory:auth:refresh:<sessionId>`
- 认证接口已扩展为：
  - `POST /v1/auth/login`
  - `POST /v1/auth/refresh`
  - `POST /v1/auth/logout`
  - `POST /v1/auth/dev-register`
  - `GET /v1/auth/profile`
  - `GET /v1/auth/public-routes`
  - `POST /v1/auth/wechat-mini/login`
- 服务可启动烟测已通过

## 当前认证策略

### Web

- 登录成功后写入两个 HttpOnly Cookie：
  - `pt_access_token`
  - `pt_refresh_token`
- `accessToken` 只用于接口鉴权
- `refreshToken` 只用于无感刷新
- `/v1/auth/profile` 读取 access token Cookie
- `x-client-type: web`

### Mini

- 当前后端已兼容 Bearer Token 方向
- `POST /v1/auth/login` 在 `x-client-type: mini-program` 时返回 body token
- `POST /v1/auth/refresh` 在 `x-client-type: mini-program` 时要求 body 传 `refreshToken`
- `GET /v1/auth/profile` 支持 `Authorization: Bearer <accessToken>`

### 微信小程序手机号一键登录

- `POST /v1/auth/wechat-mini/login` 接口骨架已预留
- 当前状态：未接入微信平台真实联调，调用时返回 `NotImplemented`
- 本轮没有虚构 `code -> openid -> session_key -> 手机号` 的真实完成状态

## 开发专用注册

- 新增 `POST /v1/auth/dev-register`
- 该接口在白名单内，不做 token 鉴权
- 该接口要求请求头 `x-dev-register-secret`
- 当前开发环境密钥来源：`.env.dev` 中的 `AUTH_DEV_REGISTER_SECRET`
- 用途：仅供开发阶段快速注册 / 重置本地账号，例如你手动注册 `admin`
- 说明：这不是后续正式注册能力

## 公开白名单接口

当前不做 token 校验的接口：

- `GET /`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/logout`
- `POST /v1/auth/dev-register`
- `GET /v1/auth/public-routes`
- `POST /v1/auth/wechat-mini/login`

## Prisma / 数据库实际落地程度

- 已落地表：
  - `users`
  - `user_auth_identities`
  - `roles`
  - `permissions`
  - `user_roles`
  - `role_permissions`
  - `menus`
  - `role_menus`
- 本轮已把数据库结构真正推到本地 PostgreSQL
- 本轮不再在仓库里写死默认管理员、默认角色、默认权限、默认菜单
- 当前如果角色/权限/菜单为空，接口会按数据库真实结果返回，前端先自行处理空数据或异常

## 合入主线后的执行说明

如果本轮 Prisma 结构变更合入 `master`，主线侧至少需要执行：

- `pnpm exec prisma generate --config prisma.config.ts`
- `pnpm exec prisma db push --config prisma.config.ts --accept-data-loss`

说明：

- 当前还是开发阶段，所以这里记录的是本地开发命令
- 等后续进入 migration 流程后，应改为 migration 方式，不再长期依赖 `db push`

## 未完成

- 未接入微信平台真实能力
  - 未调用微信接口换取 `openid / session_key`
  - 未实现微信绑定手机号一键登录闭环
- 未接入生产环境配置
- 未实现更完整的会话治理
  - 例如多端会话列表、强制踢出、设备维度管理
- 未实现完整 RBAC 管理接口，只接了登录需要的最小查询
- 未补 Prisma migration 文件
  - 本轮实际使用的是 `prisma db push`

## 已知限制

- Redis 必须可用，否则 auth2 启动时的刷新会话能力不可用
- PostgreSQL 必须可用，否则 Prisma 无法连接
- 当前 `pnpm install` 会忽略 Prisma 的构建脚本，因此服务端通过 `prestart*` 显式补了一层 `prisma generate`
- 当前角色、权限、菜单不再做仓库内硬编码兜底
- Mini 当前更像“Bearer 能力基线 + 微信登录预留”，不是微信正式登录完成版
