# 后端项目架构文档

## 1. 文档目标

本文档说明 `petory-server/` 的当前工程位置、现状、演进方向和与其他端的边界。

本文档已整合 `docs/project/ba.md` 的技术栈与实现规划内容，但架构现状仍以当前仓库真实状态为准。

---

## 2. 当前状态

后端真实工程目录为 `petory-server/`，当前由官方 Nest CLI 初始化，仍处于基础骨架阶段。

当前已确认的现状：

- 使用 NestJS 11
- 入口文件为 `src/main.ts`
- 根模块为 `src/app.module.ts`
- 当前仅保留默认 `AppController` 与 `AppService`
- 还未接入 Prisma、Redis、认证、RBAC 或业务模块

因此，本文件中的实现细则主要用于后续演进，不代表这些能力已经落地。

---

## 3. 技术栈现状与规划

### 3.1 当前已落地

- NestJS
- TypeScript
- Jest
- ESLint
- Prettier

### 3.2 规划中的后端技术栈

- Prisma
- PostgreSQL
- Redis
- Bull / Queue（按需）
- SSE（按需）
- `class-validator` / `class-transformer`
- Passport（按需）
- Web Cookie 双 Token / 小程序 Bearer Token 双认证兼容

说明：上述内容来自 `ba.md` 与项目总纲，当前属于规划预留，不应表述为已落地。

---

## 4. 设计原则

1. 模块按业务域拆分，不按技术层堆文件。
2. 认证与鉴权分离。
3. Controller 负责协议层，Service 负责业务层，Repository / Prisma 负责数据访问。
4. 不允许 Controller 直接拼复杂业务逻辑。
5. 不允许 Service 到处直接写重复 Prisma 查询。
6. 公共能力放 `common / infra`，业务能力放 `modules`。
7. 先保证边界清晰，再考虑抽象复用。

---

## 5. 目录现状与推荐结构

### 5.1 当前目录现状

```txt
petory-server/
├── src/
│   ├── common/
│   ├── infra/
│   ├── modules/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── package.json
└── tsconfig*.json
```

### 5.2 推荐演进结构

```txt
petory-server/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   ├── pipes/
│   │   ├── dto/
│   │   ├── constants/
│   │   └── utils/
│   ├── infra/
│   │   ├── prisma/
│   │   ├── redis/
│   │   ├── queue/
│   │   └── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── permissions/
│   │   ├── menus/
│   │   ├── pets/
│   │   ├── weight-logs/
│   │   ├── food-logs/
│   │   ├── vaccines/
│   │   ├── trips/
│   │   ├── llm-reports/
│   │   └── system-configs/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── schemas/
│   │   ├── auth.prisma
│   │   ├── rbac.prisma
│   │   ├── pets.prisma
│   │   ├── records.prisma
│   │   ├── llm.prisma
│   │   └── system-config.prisma
│   └── migrations/
└── test/
```

---

## 6. 分层说明

### 6.1 common 层

负责通用基础能力：

- 装饰器
- 全局 Guard
- 全局异常过滤器
- 全局拦截器
- 通用 DTO
- 常量
- 纯工具函数

规则：

- common 不写具体业务
- common 不依赖某个特定领域模块

### 6.2 infra 层

负责基础设施适配：

- PrismaService
- Redis 客户端
- Queue 能力
- 配置与日志接入

规则：

- infra 处理外部依赖接入
- 业务模块通过注入使用 infra 能力

### 6.3 modules 层

按业务域拆分模块。

每个模块建议结构：

```txt
modules/pets/
├── pets.module.ts
├── pets.controller.ts
├── pets.service.ts
├── repository/
│   └── pets.repository.ts
├── dto/
├── vo/
└── types/
```

说明：

- `controller`：处理 HTTP 输入输出
- `service`：处理业务规则
- `repository`：封装数据访问
- `dto`：接口入参与出参定义
- `vo / types`：返回视图对象与结果类型

---

## 7. 模块拆分规范

### 7.1 必须独立成模块的领域

- auth
- users
- roles
- permissions
- menus
- pets
- weight-logs
- food-logs
- vaccines
- trips
- llm-reports
- system-configs

### 7.2 可以延后或扩展的模块

- breeds
- water-logs
- vet-visits
- notifications
- uploads
- audit-logs

### 7.3 不建议的做法

- 把所有 RBAC 都塞进 auth 模块
- 把所有业务记录都塞进一个 health 模块
- 让 system-configs 模块承载所有“杂项逻辑”
- 让 `app.module.ts` 直接堆大量 provider 与业务逻辑

---

## 8. 认证与鉴权设计

### 8.1 认证

认证用于判断用户是谁。

需要支持：

- Web `accessToken + refreshToken` Cookie 认证
- 小程序 Token 认证

推荐实现：

- `AuthGuard` 统一解析登录态
- Web 走 Cookie
- 小程序走 Authorization Header

补充约束：

- `accessToken` 专门用于接口鉴权
- `refreshToken` 不直接参与业务接口鉴权，只用于无感刷新 `accessToken`
- `auth` 模块的登录与续签逻辑必须同时兼容 Web 与小程序两种认证类型

### 8.2 鉴权

鉴权用于判断用户能做什么。

推荐实现：

- `@Permissions()` 装饰器声明权限
- `PermissionGuard` 读取权限声明并校验用户权限集合

### 8.3 Guard 执行顺序

```txt
请求
 -> LoggingInterceptor
 -> AuthGuard
 -> PermissionGuard
 -> ValidationPipe
 -> Controller
```

---

## 9. Auth 与 RBAC 模块设计

### 9.1 Auth 模块职责

- Web 登录
- Web 注销
- Web accessToken 刷新
- 小程序登录
- 获取当前登录用户
- 生成 profile
- 用户身份绑定

### 9.2 Auth 推荐接口

- 说明：以下路径均挂载在后端统一基础前缀 `/v1` 之下
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/profile`
- `POST /auth/wechat-mini/login`

### 9.3 RBAC 模块职责

- roles：角色 CRUD、角色状态管理、角色菜单绑定、角色权限绑定
- permissions：权限列表管理、权限码字典维护、权限查询
- menus：菜单树管理、菜单 CRUD、菜单层级关系、菜单与角色绑定

### 9.4 RBAC 推荐接口

- 说明：以下路径均挂载在后端统一基础前缀 `/v1` 之下
- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `DELETE /roles/:id`
- `GET /permissions`
- `GET /menus/tree`
- `POST /menus`
- `PATCH /menus/:id`
- `DELETE /menus/:id`
- `PUT /users/:id/roles`
- `PUT /roles/:id/permissions`
- `PUT /roles/:id/menus`

---

## 10. Repository、DTO 与 Prisma 约束

### 10.1 Repository 约束

以下情况建议抽 Repository：

- 同一类 Prisma 查询在多个 Service 使用
- 聚合查询较复杂
- 多表事务逻辑明显
- 需要稳定复用与测试

不建议：

- 所有简单查询都抽过度 Repository
- Controller 直接用 PrismaService
- Service 复制粘贴 Prisma 查询

### 10.2 DTO / VO 规范

- 所有接口入参都必须定义 DTO
- DTO 必须使用 `class-validator`
- Query DTO 与 Body DTO 分离
- PATCH DTO 应使用 `PartialType` 或显式可选字段
- 返回给前端的结构优先收敛为 VO，不直接暴露原始 ORM 结果

### 10.3 Prisma 规范

- 主键统一 UUID
- 表名统一 snake_case
- 模型名 PascalCase
- 所有核心表必须有 `createdAt` 与 `updatedAt`
- 可恢复删除的数据建议增加 `deletedAt`
- 主 `schema.prisma`：仅存放 `datasource`、`generator` 和公共 `enum`
- `prisma/schemas/*.prisma`：按业务领域拆分，每个文件只维护本模块 `model`
- Prisma 跨文件定义不需要 `import`，由 Prisma 自动合并
- 每次 schema 变更必须提交 migration
- 不允许只改 schema 不提交 migration
- 不允许绕过 migration 直接改生产表结构

---

## 11. 业务模块设计建议

### 11.1 业务表拆分原则

推荐按业务域拆分：

- pets
- weight_logs
- food_logs
- vaccine_records
- trip_records
- trip_photos
- llm_reports
- system_configs

优点：

- 查询与索引更清晰
- 后续字段扩展更稳
- 统计和 LLM prompt 组装更容易
- Repository 不会越来越混乱

### 11.2 聚合接口与底层表结构解耦

例如：

- `/pets/:id/events`
- `/pets/:id/summary`

可以做聚合查询，但底层仍保持分表。

---

## 12. Redis、队列与 SSE 约束

### 12.1 Redis

适用场景：

- 权限缓存
- 系统配置缓存
- 频繁读取但变更少的数据
- 登录态辅助（如需要）

### 12.2 队列

推荐场景：

- LLM 周报生成
- 图片处理
- 大量统计计算
- 异步通知

### 12.3 SSE

如果 LLM 模块使用 SSE：

- Controller 只负责流式响应协议
- 具体 prompt 构造与模型调用放 Service
- 日志与审计信息单独记录
- 高风险提示语在服务端统一追加

---

## 13. 与其他端的边界

后端与其他端的边界约束如下：

- 不直接引用 `petory-web/` 或 `mini-program/` 源码
- 对外通过 HTTP API 暴露能力
- 契约以接口文档和 `docs/features/server/<feature>/api.md` 为准
- 当前不默认共享本地类型包

---

## 14. 后端开发检查清单

每次新增后端功能前，先确认：

1. 是否需要单独模块
2. 是否已有权限码
3. 是否需要菜单支持
4. 是否需要 DTO
5. 是否需要 Repository
6. 是否会影响缓存
7. 是否需要 migration
8. 是否涉及异步队列或 SSE

---

## 15. 当前结论

1. `petory-server/` 是独立后端工程，不在 monorepo 中。
2. 当前仍是 Nest 默认骨架，业务能力尚未开始落地。
3. 文档已整合 `ba.md` 的技术栈与实现规划，但这些规划内容当前不应写成已完成能力。
4. 后端正式采用 `common / infra / modules` 分层方向。
5. 认证与鉴权分离实现，复杂 Prisma 查询应收敛到 Repository。
6. Prisma Schema 采用“主 `schema.prisma` + 分模块 `.prisma` 文件”组织方式。
7. 业务记录优先分表，不做巨型通用表。
