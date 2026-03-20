# 业务数据库设计文档

## 1. 文档目标

本文档记录 Petory Portal 的数据库设计方向，作为后续服务端建模与接口设计的参考。

需要特别说明：当前仓库中尚未真正接入 Prisma、PostgreSQL 或 migration，因此本文档是“目标设计稿”，不是“当前数据库现状”。

---

## 2. 当前落地状态

当前已确认的真实状态：

- `petory-server/` 尚未引入 Prisma
- 仓库中还没有 `prisma/` 目录
- 当前没有数据库 schema 文件
- 当前没有迁移文件
- 当前也没有种子数据脚本

因此，下面的表结构设计仅用于后续落地时对齐方向。

---

## 3. 总体设计原则

1. 主键统一使用 UUID。
2. 表名统一使用 `snake_case`。
3. 核心表统一包含 `created_at`、`updated_at`。
4. 需要可恢复删除的业务数据优先使用 `deleted_at`。
5. 业务记录按领域拆表，不做超大通用表。
6. 关系表只负责关系，不混入复杂业务字段。
7. 配置类表允许使用 JSONB，但接口层应按配置域收敛。

---

## 4. 设计范围

当前设计覆盖以下几个方向：

- 用户与认证
- RBAC 与菜单
- 宠物基础资料
- 宠物业务记录
- LLM 报告与请求日志
- 系统配置

---

## 5. 规划中的核心表

### 5.1 用户与认证

规划表：

- `users`
- `user_auth_identities`

目标：

- 支撑 Web 账号登录
- 支撑微信小程序登录
- 为后续账号绑定预留空间

### 5.2 RBAC 与菜单

规划表：

- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `menus`
- `role_menus`

目标：

- 支撑角色、权限和导航分离
- 支撑 Web 后台权限管理
- 为小程序差异化菜单或入口预留空间

### 5.3 宠物领域

规划表：

- `breeds`
- `pets`
- `pet_collaborators`

目标：

- 管理宠物基础资料
- 管理宠物主人与协作者关系

### 5.4 业务记录

规划表：

- `weight_logs`
- `food_logs`
- `water_logs`
- `vaccine_records`
- `trip_records`
- `trip_photos`
- `vet_visits`

设计原则：

- 不将所有记录堆入单一大表
- 按记录类型拆分，便于统计、索引和后续扩展

### 5.5 LLM 与配置

规划表：

- `llm_reports`
- `llm_request_logs`
- `system_configs`

---

## 6. 接口聚合思路

数据库层面保持分表，接口层面做聚合：

- `GET /pets/:id/events`：聚合宠物时间线
- `GET /pets/:id/summary`：聚合宠物摘要

这意味着“时间线”和“摘要”是接口概念，不要求数据库必须有同名总表。

---

## 7. 落地注意事项

当服务端真正开始接入数据库时，建议同步完成以下事项：

- 在 `petory-server/` 中新增 `prisma/` 目录
- 建立 schema 与 migration
- 将设计稿中的“规划字段”收敛为真实字段
- 在 `docs/features/server/<feature>/api.md` 中反映契约变更
- 在 `docs/features/server/<feature>/changelog.md` 中记录实际落地内容

---

## 8. 当前结论

1. 数据库设计文档当前是规划稿，不是实现说明。
2. 文档中提到的表结构还没有在代码中落地。
3. 后续落地时，应以 `petory-server/` 为真实实现位置，而不是旧文档中的其他路径写法。
4. 一旦开始建模，文档需要从“纯设计稿”升级为“设计稿 + 已实现状态”。
