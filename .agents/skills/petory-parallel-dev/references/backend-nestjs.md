# NestJS 开发约束

适用于 `petory-server/`。

## 模块原则

- 一个业务域一个模块
- 层次职责清晰
- 避免在 `app.module` 堆积业务逻辑

## 分层职责

### Controller

- 接收入参
- 调用 service
- 返回响应
- 挂接协议层装饰器

### Service

- 承担业务规则
- 编排领域流程
- 做权限前置判断
- 调用 repository

### Repository

以下情况优先抽取：

- Prisma 查询重复出现
- 查询逻辑复杂
- 存在多表聚合
- 需要统一事务处理

### DTO

- 所有入参都 DTO 化
- Query DTO 和 Body DTO 分离
- PATCH 使用可选字段或 `PartialType`

### VO

- 稳定对外返回结构优先定义 VO
- 不直接把 ORM 查询结果原样透出

## 推荐模块结构

```text
module/
├── xxx.module.ts
├── xxx.controller.ts
├── xxx.service.ts
├── dto/
├── vo/
└── repository/
```

## 权限规则

- 接口权限声明用 `@Permissions()`
- 接口权限统一由 Guard 处理
- 业务资源归属判断可以放在 service

## 避免的做法

- Controller 直接查数据库
- Service 写 HTTP 协议层逻辑
- 无边界的 common service
- 一个模块同时承载多个领域
