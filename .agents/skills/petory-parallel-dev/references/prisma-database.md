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
