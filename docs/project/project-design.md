# Petory Portal 项目设计文档

## 1. 文档目标

本文档说明当前仓库的真实组织方式、三端边界和项目级约束。

本文档以仓库现状为准，并遵循根目录 `AGENTS.md` 中定义的三线程 + `git worktree` 协作流程。

---

## 2. 当前仓库状态

当前仓库是一个“大仓库但非 monorepo”的单仓管理项目，包含三个彼此独立的应用：

- `petory-server/`：NestJS 后端工程
- `petory-web/`：React + Vite Web 前端工程
- `mini-program/`：Taro + React 微信小程序工程

当前三个工程都已完成各自官方 CLI 初始化，但仍处于非常早期的基础状态：

- `petory-server/` 仍是 Nest 默认示例模块
- `petory-web/` 仍是 Vite/React 默认示例页面
- `mini-program/` 仍是 Taro 默认首页

因此，`docs/project` 中的设计文档应理解为“项目约束 + 规划方向”，不能等同于“当前已经实现”。

---

## 3. 仓库组织方式

### 3.1 目录基线

```txt
petory-portal/
├── docs/
│   ├── features/
│   └── project/
├── mini-program/
├── petory-server/
├── petory-web/
└── AGENTS.md
```

### 3.2 非 monorepo 约束

当前仓库明确不是 `pnpm workspace` / Turborepo / Nx 这类 monorepo 结构，约束如下：

- 根目录不统一管理三端依赖
- 三端各自维护自己的 `package.json` 和锁文件
- 三端默认独立安装依赖、独立运行、独立构建
- 当前没有根级共享包目录，如 `packages/*`
- 当前没有 `apps/*` 目录分层

### 3.3 代码共享边界

当前阶段不做真实代码共享，避免在尚未稳定的阶段提前引入耦合：

- `petory-server/` 不直接依赖 `petory-web/`
- `petory-web/` 不直接依赖 `mini-program/`
- `mini-program/` 不直接依赖其他端的源码

如果后续确实需要共享类型或工具，应单独评估并补充文档，而不是默认按 monorepo 思路演进。

---

## 4. 三端职责边界

### 4.1 Server

`petory-server/` 负责：

- 接口提供
- 鉴权与权限控制
- 数据模型与持久化
- 统一错误处理与服务端约束

### 4.2 Web

`petory-web/` 负责：

- 管理后台或 Web 业务页面
- 页面结构、交互和状态流转
- 请求接入与联调

### 4.3 Mini Program

`mini-program/` 负责：

- 微信小程序页面与交互
- 小程序端登录态、缓存与端适配
- 依赖后端接口完成业务流

---

## 5. 文档组织约束

项目文档分为两类：

- `docs/project/`：项目级设计、约束、流程、环境说明
- `docs/features/`：按功能和端拆分的交付文档

`docs/features/` 必须遵循 `AGENTS.md` 中的目录规则：

```txt
docs/features/
  server/
  web/
  miniprogram/
```

每个功能文档按端落到各自目录中，不混放。

---

## 6. 工程管理结论

当前仓库正式采用以下结论：

1. 仓库是单仓库、多应用、非 monorepo 结构。
2. 三端工程目录固定为 `petory-server/`、`petory-web/`、`mini-program/`。
3. 三端依赖、脚本、构建和发布当前均独立维护。
4. 功能开发流程遵循 `master` + 三条短期分支 + 三个临时 worktree。
5. 设计文档必须区分“当前实现状态”和“后续规划”，避免把规划写成既成事实。
