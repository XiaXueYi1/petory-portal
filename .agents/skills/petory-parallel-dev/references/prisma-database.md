# Prisma 与数据库约束

## 基础规则

- 主键统一 UUID
- 表名统一 `snake_case`
- 核心表包含 `created_at`、`updated_at`
- 软删除场景优先使用 `deleted_at`
- 修改 schema 时同步准备 migration

## 当前项目定位

当前仓库里数据库能力仍偏规划态。

如果开始落地数据库：

- 以 `petory-server/` 为真实落地点
- 文档从规划稿升级为“规划 + 已实现”
- 接口契约同步回写 `docs/features/server/<feature>/`

## Prisma schema 组织规则

- 主 `schema.prisma`：仅存放 `datasource`、`generator` 配置，以及所有公共 `enum`
- 各模块目录：按业务领域拆分，每个模块一个 `.prisma` 文件，只存放该模块的 `model`
- 跨文件引用：无需 `import`，Prisma 自动合并；公共 `enum` 在任意模块文件中可直接使用

推荐结构：

```text
petory-server/
└── prisma/
    ├── schema.prisma
    └── schemas/
        ├── auth.prisma
        ├── rbac.prisma
        ├── pets.prisma
        ├── records.prisma
        ├── llm.prisma
        └── system-config.prisma
```

补充规则：

- 不把所有 `model` 堆在主 `schema.prisma`
- 不为 Prisma 文件写自定义 `import`
- 公共 `enum` 统一维护在主 `schema.prisma`
- 单个模块文件避免跨领域混放模型

## 查询规范

- 列表查询必须分页
- 排序字段显式声明
- where 条件尽量收敛在 query DTO
- 聚合查询优先下沉到 repository
- 避免 N+1

## 索引思路

重点考虑：

- 用户 ID
- 宠物 ID
- 时间字段
- code 字段
- config key
- 关系表组合字段

## 避免的做法

- 只改 schema 不处理 migration
- 不分页直接查全表
- Controller 直接拼复杂查询
- 把数据库约束问题完全留给下游兜底
- 在 Prisma 文件之间手写 import 依赖
