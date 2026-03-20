# 后端项目架构文档

## 1. 文档目标

本文档说明 `petory-server/` 的当前工程位置、现状、演进方向和与其他端的边界。

---

## 2. 当前状态

后端真实工程目录为 `petory-server/`，当前由官方 Nest CLI 初始化，仍处于基础骨架阶段。

当前已确认的现状：

- 使用 NestJS 11
- 入口文件为 `src/main.ts`
- 根模块为 `src/app.module.ts`
- 当前仅保留默认 `AppController` 与 `AppService`
- 还未接入 Prisma、Redis、认证、RBAC 或业务模块

因此，本文件中的架构建议主要用于后续演进，不代表这些能力已经落地。

---

## 3. 技术栈现状

当前已落地：

- NestJS
- TypeScript
- Jest
- ESLint
- Prettier

尚未落地但可作为规划预留：

- Prisma
- PostgreSQL
- Redis
- class-validator / class-transformer

---

## 4. 目录现状

当前目录结构大致如下：

```txt
petory-server/
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── package.json
└── tsconfig*.json
```

---

## 5. 推荐演进方向

在后续功能真正开始实现后，推荐逐步演进为如下结构：

```txt
petory-server/
├── src/
│   ├── common/
│   ├── infra/
│   ├── modules/
│   └── main.ts
├── prisma/
└── test/
```

建议含义：

- `common/`：跨模块公共能力，如装饰器、异常、拦截器、守卫
- `infra/`：数据库、缓存、配置、日志等基础设施接入
- `modules/`：按业务领域划分模块
- `prisma/`：数据库 schema、migration、seed

---

## 6. 与其他端的边界

后端与其他端的边界约束如下：

- 不直接引用 `petory-web/` 或 `mini-program/` 源码
- 对外通过 HTTP API 暴露能力
- 契约以接口文档和 `docs/features/server/<feature>/api.md` 为准
- 当前不默认共享本地类型包

---

## 7. 当前结论

1. `petory-server/` 是独立后端工程，不在 monorepo 中。
2. 当前仍是 Nest 默认骨架，业务能力尚未开始落地。
3. Prisma、数据库、缓存、认证、RBAC 属于后续建设项，不应在其他文档中表述为“已实现”。
4. 后续后端文档应同时记录“当前已落地内容”和“推荐演进结构”。
