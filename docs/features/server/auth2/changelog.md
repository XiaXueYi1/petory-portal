# auth2 server changelog

## 本轮新增

- 新建 `petory-server/.env.dev`
- 新建 `petory-server/.env.prod`
- 新建 Prisma 7 配置文件 `petory-server/prisma.config.ts`
- 新建 Prisma 多文件 schema：
  - `petory-server/prisma/schema.prisma`
  - `petory-server/prisma/schemas/users.prisma`
  - `petory-server/prisma/schemas/roles.prisma`
  - `petory-server/prisma/schemas/permissions.prisma`
  - `petory-server/prisma/schemas/menus.prisma`
- 新建基础 infra：
  - `src/infra/database/prisma.service.ts`
  - `src/infra/database/prisma.module.ts`
  - `src/infra/cache/redis.service.ts`
  - `src/infra/cache/redis.module.ts`
- 新建 auth2 相关服务 / DTO：
  - `AuthPasswordService`
  - `AuthTokenService`
  - `AuthSessionService`
  - `DevRegisterDto`

## 本轮修改

- `AppModule` 已接入：
  - `ConfigModule`
  - `PrismaModule`
  - `RedisModule`
  - 全局 `AuthGuard`
- `main.ts` 已启用全局 `ValidationPipe`
- `AuthGuard` 已改为真实 token 鉴权
- `auth` 模块已从内存仓库改为 Prisma + PostgreSQL
- `clientType` 不再从 body 读取，统一从请求头 `x-client-type` 读取
- 新增开发专用接口：`POST /v1/auth/dev-register`
- 新增白名单查询接口：`GET /v1/auth/public-routes`
- 去掉了仓库内默认管理员 / 默认角色 / 默认权限 / 默认菜单的硬编码初始化
- `package.json` 已为 `start` / `start:dev` / `start:debug` / `start:prod` 增加 Prisma client 生成前置步骤，避免新环境因 `pnpm install` 跳过构建脚本而启动失败

## 依赖安装

本轮新增依赖：

- `@nestjs/config`
- `class-validator`
- `class-transformer`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`
- `ioredis`
- `prisma`
- `dotenv`

说明：

- 仅安装了 auth2 本轮直接需要的最小依赖
- 没有泛装 JWT、bcrypt、Passport 等额外依赖

## 实际执行命令

已执行：

- `pnpm add @nestjs/config class-validator class-transformer @prisma/client ioredis`
- `pnpm add -D prisma dotenv`
- `pnpm add @prisma/adapter-pg pg`
- `pnpm exec prisma validate --config prisma.config.ts`
- `pnpm exec prisma generate --config prisma.config.ts`
- `pnpm exec prisma db push --config prisma.config.ts --accept-data-loss`
- `pnpm run lint`
- `pnpm exec jest --runInBand`
- `pnpm exec tsc --noEmit`
- `pnpm exec node -r ts-node/register -e "...createApplicationContext(AppModule)..."`
- `pnpm run start:dev`

## 通过的校验

- Prisma schema validate：通过
- Prisma client generate：通过
- Prisma db push：通过
- ESLint：通过
- Jest：通过
- TypeScript `tsc --noEmit`：通过
- Nest application context 启动烟测：通过（`BOOT_OK`）
- Nest dev 启动烟测：通过，服务已监听 `3000`

## 合入 master 后需要执行

如果这轮 Prisma 结构变更合入 `master`，主线侧至少需要执行：

- `pnpm exec prisma generate --config prisma.config.ts`
- `pnpm exec prisma db push --config prisma.config.ts --accept-data-loss`

说明：

- 当前还是开发阶段，所以这里记录的是本地开发命令
- 等后续进入 migration 流程后，应改为 migration 方式，不再长期依赖 `db push`

## 未完成

- 未接微信平台真实联调
- 未补 production 真值配置
- 未补 Prisma migration 文件
- 未接完整 RBAC 管理接口

## 已知限制

- 开发注册接口只适用于开发阶段，不代表正式注册方案
- 当前角色、权限、菜单不再做仓库内硬编码兜底，返回结果以数据库真实数据为准
- 新环境如果刚执行过 `pnpm install`，会通过 `prestart*` 自动生成 Prisma client，不再依赖手动补一次 `prisma generate`
- 微信小程序手机号一键登录本轮只预留了接口骨架，没有宣称已完成真实调用
