# 业务数据库设计文档

## 1. 文档目标

本文档记录 Petory Portal 的数据库设计方向，作为后续服务端建模与接口设计的参考。

本文档已整合 `docs/project/db-prd.md` 的设计内容，作为数据库设计主文档。

需要特别说明：当前仓库中的数据库能力已经开始落地，但本文档仍以“目标设计稿 + 落地约束说明”为主，并需持续根据真实实现修订。

---

## 2. 当前落地状态

当前已确认的真实状态：

- `petory-server/` 已接入 Prisma 与 PostgreSQL
- 当前认证相关表已经有本地开发落地基线
- migration 流程仍未完全收敛
- 文档中部分字段仍属于设计方向，需要继续与真实实现同步

因此，下面的表结构设计既包含当前方向，也包含后续待收敛项，不应机械理解为“全部已完成”。

---

## 3. 总体设计原则

1. 主键统一使用 UUID。
2. 表名统一使用 `snake_case`。
3. 所有核心表必须包含 `created_at`、`updated_at`。
4. 可恢复删除的数据优先设计 `deleted_at`。
5. 业务记录优先按领域拆表，不做超大通用表。
6. 关系表只负责关系，不混入复杂业务字段。
7. 配置类表允许使用 JSONB，但接口层必须按配置域收敛。
8. 所有设计均以 `petory-server/` 为未来真实实现位置。

---

## 4. Prisma Schema 组织约束

当后端开始接入 Prisma 时，Schema 文件组织统一采用以下规则：

- 主 `schema.prisma`：仅存放 `datasource`、`generator` 配置，以及所有公共 `enum`
- 各模块目录：按业务领域拆分，每个模块一个 `.prisma` 文件，只存放该模块的 `model`
- 跨文件引用：无需 `import`，Prisma 自动合并；公共 `enum` 可在任意模块文件中直接使用

推荐结构：

```txt
petory-server/
├── prisma/
│   ├── schema.prisma
│   └── schemas/
│       ├── auth.prisma
│       ├── rbac.prisma
│       ├── pets.prisma
│       ├── records.prisma
│       ├── llm.prisma
│       └── system-config.prisma
```

补充约束：

- 不要把所有 `model` 全部堆回主 `schema.prisma`
- 不要为 Prisma 文件引入自定义 `import`
- 公共 `enum` 统一维护在主 `schema.prisma`
- 模块文件只承担本领域数据模型定义，避免跨领域混放

---

## 5. 设计范围

当前数据库设计覆盖以下几个方向：

- 用户与认证
- RBAC 与菜单
- 宠物基础资料
- 宠物业务记录
- LLM 报告与请求日志
- 系统配置

---

## 5.1 本地开发数据库连接基线

当前本地开发阶段约定的 PostgreSQL 连接信息如下：

- JDBC URL：`jdbc:postgresql://localhost:5432/postgres`
- Host：`localhost`
- Port：`5432`
- Database：`postgres`
- Schema：`public`
- Username：`postgres`
- Password：`123456`

如果后续接入 Prisma，可对应收敛为：

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/postgres?schema=public"
```

说明：

- 以上为当前本地开发数据库基线，不代表生产环境配置
- 当前仓库尚未真正接入 Prisma 与数据库代码，本段用于后续落地时统一连接参数

---

## 6. 用户与认证相关表

### 6.1 users

用途：系统用户主表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 用户主键 |
| email | VARCHAR NULL | 邮箱 |
| phone | VARCHAR NULL | 手机号 |
| nickname | VARCHAR NOT NULL | 昵称 |
| avatar | TEXT NULL | 头像 |
| status | VARCHAR NOT NULL | `active / disabled` |
| last_login_at | TIMESTAMP NULL | 最近登录时间 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

约束建议：

- `email` 可唯一，允许为空
- `phone` 可唯一，允许为空

### 6.2 user_auth_identities

用途：用户多身份登录绑定。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| user_id | UUID FK | 关联用户 |
| provider | VARCHAR NOT NULL | `web_password / mini_openid / wechat_mini_program_reserved` |
| provider_user_id | VARCHAR NOT NULL | phone / openid / unionid 等 |
| credential_hash | TEXT NULL | Web 密码哈希等 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

约束建议：

- `(provider, provider_user_id)` 唯一

补充说明：

- Web 端推荐收敛为 `phone + password`
- 小程序现阶段推荐使用 `phone + appCode(code)` 登录，但 `appCode` 不建议直接入库
- 更稳妥的绑定方式是服务端实时用 `appCode` 换取 `openid`，并在 `user_auth_identities` 中保存 `mini_openid`
- 首次登录时按 `phone + openid` 建立绑定
- 后续重新登录时按手机号命中已绑定的 `openid` 关系即可重新签发 token
- 当小程序端手机号首次登录且库中不存在该用户时，可自动创建用户，并给默认随机昵称、空头像

---

## 7. RBAC 与菜单相关表

### 7.1 roles

用途：角色表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| code | VARCHAR UNIQUE | `user / vet / admin` |
| name | VARCHAR NOT NULL | 角色名称 |
| description | TEXT NULL | 描述 |
| status | VARCHAR NOT NULL | 状态 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 7.2 permissions

用途：权限表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| code | VARCHAR UNIQUE | `resource:action` |
| name | VARCHAR NOT NULL | 权限名称 |
| resource | VARCHAR NOT NULL | 资源名 |
| action | VARCHAR NOT NULL | 动作名 |
| description | TEXT NULL | 描述 |
| status | VARCHAR NOT NULL | 状态 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

说明：

- `code` 规范为 `resource:action`
- `resource` 与 `action` 冗余存储，便于搜索与管理

### 7.3 user_roles

用途：用户角色关系表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| user_id | UUID FK | 用户 |
| role_id | UUID FK | 角色 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |

约束建议：

- `(user_id, role_id)` 唯一

### 7.4 role_permissions

用途：角色权限关系表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| role_id | UUID FK | 角色 |
| permission_id | UUID FK | 权限 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |

约束建议：

- `(role_id, permission_id)` 唯一

### 7.5 menus

用途：菜单表，承载导航与动态路由配置。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| parent_id | UUID NULL | 父菜单 |
| code | VARCHAR UNIQUE | 菜单编码 |
| name | VARCHAR NOT NULL | 菜单名 |
| path | VARCHAR NOT NULL | 路由路径 |
| component_key | VARCHAR NOT NULL | 前端组件映射 key |
| icon | VARCHAR NULL | 图标 |
| sort | INT NOT NULL | 排序 |
| type | VARCHAR NOT NULL | `directory / menu / page` |
| visible | BOOLEAN NOT NULL | 是否显示 |
| status | VARCHAR NOT NULL | 状态 |
| permission_code | VARCHAR NULL | 页面访问所需权限 |
| is_external | BOOLEAN NOT NULL | 是否外链 |
| keep_alive | BOOLEAN NOT NULL | 是否缓存 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 7.6 role_menus

用途：角色菜单关系表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| role_id | UUID FK | 角色 |
| menu_id | UUID FK | 菜单 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |

约束建议：

- `(role_id, menu_id)` 唯一

---

## 8. 宠物领域表

### 8.1 breeds

用途：品种基础表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| species | VARCHAR NOT NULL | `cat / dog` |
| name | VARCHAR NOT NULL | 品种名 |
| is_popular | BOOLEAN NOT NULL | 是否热门 |
| sort | INT NOT NULL | 排序 |
| avg_weight_min | NUMERIC NULL | 平均体重下限 |
| avg_weight_max | NUMERIC NULL | 平均体重上限 |
| status | VARCHAR NOT NULL | 状态 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 8.2 pets

用途：宠物基础资料表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| owner_user_id | UUID FK | 主人用户 ID |
| name | VARCHAR NOT NULL | 宠物名 |
| species | VARCHAR NOT NULL | `cat / dog` |
| breed_id | UUID NULL | 品种 |
| sex | VARCHAR NULL | 性别 |
| birth_date | DATE NULL | 生日 |
| neutered | BOOLEAN NOT NULL | 是否绝育 |
| avatar | TEXT NULL | 头像 |
| color | VARCHAR NULL | 毛色 |
| notes | TEXT NULL | 备注 |
| status | VARCHAR NOT NULL | 状态 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |
| deleted_at | TIMESTAMP NULL | 软删除 |

说明：

- `owner_user_id` 表示业务主拥有者
- 如果后续需要医生/家人协作，可扩展协作者表

### 8.3 pet_collaborators（可选但推荐）

用途：宠物协作关系表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| user_id | UUID FK | 协作者 |
| role | VARCHAR NOT NULL | `owner / vet / family_member` |
| status | VARCHAR NOT NULL | 状态 |
| invited_at | TIMESTAMP NULL | 邀请时间 |
| accepted_at | TIMESTAMP NULL | 接受时间 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

作用：

- 为后续“医生仅访问被授权宠物”提供基础

---

## 9. 业务记录表

### 9.1 为什么采用分表设计

不建议把以下字段堆在一个 `health_logs` 表中：

- 体重
- 食物
- 饮水
- 心情
- 疫苗
- 就诊
- 出行

原因：

- nullable 字段越来越多
- 统计语义不清
- 索引策略难以收敛
- 后续扩展困难
- LLM prompt 拼装不够清晰

因此本项目采用“业务记录分表 + 聚合接口”的策略。

### 9.2 weight_logs

用途：体重记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| weight_kg | NUMERIC(6,2) NOT NULL | 体重 |
| measured_at | TIMESTAMP NOT NULL | 测量时间 |
| notes | TEXT NULL | 备注 |
| llm_comment | TEXT NULL | LLM 单次分析结论 |
| created_by | UUID FK NULL | 创建人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 9.3 food_logs

用途：饮食记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| food_type | VARCHAR NOT NULL | 食物类型 |
| food_brand | VARCHAR NULL | 品牌 |
| amount_g | NUMERIC(8,2) NULL | 克数 |
| fed_at | TIMESTAMP NOT NULL | 喂食时间 |
| notes | TEXT NULL | 备注 |
| created_by | UUID FK NULL | 创建人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 9.4 water_logs（可选）

用途：饮水记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| amount_ml | NUMERIC(8,2) NOT NULL | 饮水量 |
| logged_at | TIMESTAMP NOT NULL | 记录时间 |
| notes | TEXT NULL | 备注 |
| created_by | UUID FK NULL | 创建人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 9.5 vaccine_records

用途：疫苗记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| vaccine_name | VARCHAR NOT NULL | 疫苗名称 |
| vaccinated_at | DATE NOT NULL | 接种日期 |
| next_due_date | DATE NULL | 下次到期时间 |
| hospital_name | VARCHAR NULL | 接种机构 |
| notes | TEXT NULL | 备注 |
| created_by | UUID FK NULL | 创建人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 9.6 trip_records

用途：出行记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| title | VARCHAR NOT NULL | 出行标题 |
| location | VARCHAR NULL | 地点 |
| started_at | TIMESTAMP NULL | 开始时间 |
| ended_at | TIMESTAMP NULL | 结束时间 |
| notes | TEXT NULL | 备注 |
| created_by | UUID FK NULL | 创建人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 9.7 trip_photos

用途：出行照片。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| trip_record_id | UUID FK | 出行记录 |
| image_url | TEXT NOT NULL | 图片 URL |
| sort | INT NOT NULL | 排序 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 9.8 vet_visits（建议预留）

用途：就诊记录。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| hospital_name | VARCHAR NULL | 医院 |
| visit_reason | VARCHAR NOT NULL | 就诊原因 |
| diagnosis | TEXT NULL | 诊断结果 |
| visited_at | TIMESTAMP NOT NULL | 就诊时间 |
| notes | TEXT NULL | 备注 |
| created_by | UUID FK NULL | 创建人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

---

## 10. LLM 与配置表

### 10.1 llm_reports

用途：LLM 输出的报告与摘要。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| pet_id | UUID FK | 宠物 |
| report_type | VARCHAR NOT NULL | `weekly / monthly / custom` |
| title | VARCHAR NOT NULL | 标题 |
| content | TEXT NOT NULL | 结果内容 |
| provider | VARCHAR NULL | 提供商，如 `deepseek` |
| model_name | VARCHAR NULL | 使用模型 |
| prompt_version | VARCHAR NULL | Prompt 版本 |
| created_by | UUID FK NULL | 触发人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 10.2 llm_request_logs

用途：LLM 请求审计日志。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| user_id | UUID FK NULL | 请求用户 |
| pet_id | UUID FK NULL | 相关宠物 |
| feature | VARCHAR NOT NULL | `chat / weekly_report / advice` |
| provider | VARCHAR NULL | 提供商，如 `deepseek` |
| model_name | VARCHAR NULL | 模型名 |
| prompt_version | VARCHAR NULL | Prompt 版本 |
| input_tokens | INT NULL | 输入 token |
| output_tokens | INT NULL | 输出 token |
| latency_ms | INT NULL | 耗时 |
| status | VARCHAR NOT NULL | `success / failed` |
| error_message | TEXT NULL | 错误信息 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

### 10.3 system_configs

用途：系统配置。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| config_key | VARCHAR UNIQUE | 配置键 |
| config_group | VARCHAR NOT NULL | 配置组 |
| config_value | JSONB NOT NULL | 配置值 |
| description | TEXT NULL | 描述 |
| status | VARCHAR NOT NULL | 状态 |
| updated_by | UUID FK NULL | 更新人 |
| created_at | TIMESTAMP NOT NULL | 创建时间 |
| updated_at | TIMESTAMP NOT NULL | 更新时间 |

建议配置组：

- `miniapp_tabs`
- `llm`
- `notification`
- `platform`

---

## 11. 索引与约束建议

### 11.1 高频索引建议

- `pets.owner_user_id`
- `weight_logs.pet_id + measured_at`
- `food_logs.pet_id + fed_at`
- `vaccine_records.pet_id + vaccinated_at`
- `trip_records.pet_id + started_at`
- `llm_reports.pet_id + report_type + created_at`
- `roles.code`
- `permissions.code`
- `menus.code`
- `system_configs.config_key`

### 11.2 唯一约束建议

- `roles.code`
- `permissions.code`
- `menus.code`
- `system_configs.config_key`
- `user_roles(user_id, role_id)`
- `role_permissions(role_id, permission_id)`
- `role_menus(role_id, menu_id)`
- `user_auth_identities(provider, provider_user_id)`

---

## 12. 推荐的聚合接口与表关系

### 12.1 宠物时间线

接口：

- `GET /pets/:id/events`

聚合来源：

- `weight_logs`
- `food_logs`
- `vaccine_records`
- `trip_records`
- `vet_visits`

说明：

- 时间线是接口聚合概念，不要求底层共表

### 12.2 宠物摘要

接口：

- `GET /pets/:id/summary`

聚合来源：

- `pets`
- 最近体重记录
- 最近疫苗记录
- 最近出行记录
- LLM 报告摘要

---

## 13. 落地注意事项

当服务端真正开始接入数据库时，建议同步完成以下事项：

- 在 `petory-server/` 中新增 `prisma/` 目录
- 建立主 `schema.prisma` 与分模块 `.prisma` 文件
- 将设计稿中的“规划字段”收敛为真实字段
- Prisma Schema 变更必须伴随 migration 文件
- 新增非空字段必须有默认值或完整数据迁移方案
- 在 `docs/features/server/<feature>/api.md` 中反映契约变更
- 在 `docs/features/server/<feature>/changelog.md` 中记录实际落地内容

---

## 14. 当前结论

1. 数据库设计文档当前是规划稿，不是实现说明。
2. 文档中提到的表结构还没有在代码中落地。
3. 用户、认证、RBAC、菜单、宠物、业务记录、LLM、系统配置已形成统一设计方向。
4. Prisma Schema 采用“主 `schema.prisma` + 分模块 `.prisma` 文件”组织方式。
5. 业务记录采用分表设计，时间线与摘要通过聚合接口实现。
6. 后续落地时，应以 `petory-server/` 为真实实现位置，而不是旧文档中的其他路径写法。
7. 一旦开始建模，文档需要从“纯设计稿”升级为“设计稿 + 已实现状态”。
