# Petory Portal 项目设计文档

## 1. 文档目标

本文档作为 Petory Portal 的项目总纲，用于统一以下内容：

- 当前仓库真实结构与协作边界
- 产品定位与系统范围
- 核心功能规划
- 技术选型与落地状态
- 多端协作原则
- 各专项设计文档之间的关系

本文档以当前仓库真实状态为准。

需要特别区分两类信息：

- 当前已落地内容：以仓库现状为准
- 后续规划内容：来自 PRD 与专项设计文档，不视为已实现

---

## 2. 项目定位

Petory Portal 是一个围绕宠物档案、健康记录、疫苗管理、出行记录和 LLM 健康辅助分析构建的多端系统。

当前项目规划包含三个端：

- `petory-web/`：Web 管理端 / Web 用户端承载体
- `petory-server/`：NestJS 后端服务
- `mini-program/`：微信小程序端（Taro）

系统目标：

1. 为宠物主人提供统一的宠物档案与健康记录平台。
2. 为后台管理、权限控制和系统配置提供标准化治理能力。
3. 为小程序提供便捷的业务入口与移动端体验。
4. 为 LLM 健康摘要、问答、建议与风险提示提供结构化数据基础。

---

## 3. 当前仓库状态

当前仓库是一个“大仓库但非 monorepo”的单仓管理项目，包含三个彼此独立的应用：

- `petory-server/`：NestJS 后端工程
- `petory-web/`：React + Vite Web 前端工程
- `mini-program/`：Taro + React 微信小程序工程

当前仓库已经完成基础搭建，并在 `auth` / `auth2` 阶段落下了第一批真实能力：

- `petory-server/` 已完成 `common / infra / modules` 分层基线，并落地最小认证能力
- `petory-web/` 已完成应用级分层、基础登录页和 Web 登录闭环
- `mini-program/` 已完成环境变量基线与 Bearer Token 请求层设计

但项目整体仍处于早期阶段，尚未进入大规模业务模块建设期。因此，项目文档仍应理解为“仓库约束 + 已落地基线 + 产品规划 + 演进方向”，不能把后续规划内容当作当前已实现能力。

---

## 4. 仓库组织与协作边界

### 4.1 目录基线

```txt
petory-portal/
├── .agents/
├── docs/
│   ├── features/
│   └── project/
├── mini-program/
├── petory-server/
├── petory-web/
├── .gitignore
└── AGENTS.md
```

### 4.2 工程组织原则

当前仓库明确不是 `pnpm workspace` / Turborepo / Nx 这类 monorepo 结构，约束如下：

- 根目录不统一管理三端依赖
- 三端各自维护自己的 `package.json` 和锁文件
- 三端默认独立安装依赖、独立运行、独立构建
- 当前没有根级共享包目录，如 `packages/*`
- 当前没有 `apps/*` 目录分层
- 顶层协作规则以根目录 `AGENTS.md` 为准

### 4.3 代码共享边界

当前阶段不做真实跨端运行时代码共享，避免在基础阶段过早引入耦合：

- `petory-server/` 不直接依赖 `petory-web/` 或 `mini-program/`
- `petory-web/` 不直接依赖 `mini-program/` 或 `petory-server/` 源码
- `mini-program/` 不直接依赖其他端源码

后续若需要共享内容，原则上只考虑：

- TypeScript 类型定义
- DTO / Response 类型约定
- 纯函数工具
- 枚举与常量定义

在真正引入共享层之前，不应把共享能力写成既成事实。

---

## 5. 设计原则

### 5.1 统一原则

- 统一产品语义：同一业务概念在各端命名一致
- 统一 API 协议：接口响应结构、错误码、分页结构统一
- 统一领域模型：用户、角色、权限、宠物、记录、疫苗等基础模型统一
- 统一文档来源：设计文档在仓库内长期维护

### 5.2 工程原则

- 先收敛目录和边界，再扩展功能
- 当前以真实目录为准，不虚构 `web/`、`server/`、`apps/*` 等不存在路径
- Web 与 Server 的协作以接口契约为主，不依赖源码互引
- Mini Program 共仓管理，但保持实现边界清晰
- 功能交付与文档同步推进，避免只更新代码不更新文档

### 5.3 安全原则

- 权限以后端鉴权为最终边界
- 前端菜单与按钮控制只作为体验增强，不作为安全依据
- 认证与鉴权分离
- 多端登录统一用户域模型，但允许不同会话承载方式

---

## 6. 技术选型

### 6.1 当前已落地

Web：

- React 19
- Vite 8
- TypeScript 5
- ESLint
- React Router
- `axios`
- class 形态请求层
- 基础主题与应用启动壳层

Server：

- NestJS 11
- TypeScript
- Jest
- ESLint
- Prettier
- `@nestjs/config`
- `class-validator` / `class-transformer`
- Prisma
- PostgreSQL
- Redis
- Web Cookie 双 Token / Mini Bearer Token 双认证兼容

Mini Program：

- Taro 4.x
- React 写法
- TypeScript
- `.env.dev / .env.prod` 环境变量基线
- class 形态请求层
- Bearer Token 认证方向

包管理与环境：

- 三端统一使用 `pnpm`
- 当前仓库不是 workspace

### 6.2 规划中的技术选型

以下内容来自 PRD 与专项设计文档，当前可视为后续落地方向：

Web：

- React Router
- Zustand
- TanStack Query
- Ant Design
- Ant Design X
- Tailwind CSS
- 请求封装层

Server：

- Bull / Queue（按需）
- SSE（按需，用于 LLM 流式输出）

Mini Program：

- 微信平台真实登录能力接入
- refresh 续签闭环
- 按小程序端特性单独处理缓存与鉴权

### 6.3 技术选型说明

- 规划中的技术栈不等于当前已经接入
- 所有新增基础设施都应先更新专项设计文档，再进入实现
- 文档中若出现与当前仓库不一致的旧路径或旧组织方式，应以当前仓库结构修正

---

## 7. 三端职责边界

### 7.1 Server

`petory-server/` 负责：

- 接口提供
- 鉴权与权限控制
- 数据模型与持久化
- 统一错误处理与服务端约束
- 为 Web / Mini Program 提供稳定契约

### 7.2 Web

`petory-web/` 负责：

- 管理后台或 Web 业务页面
- 页面结构、交互和状态流转
- 请求接入与联调
- 后台配置、管理视图与运营能力承载

### 7.3 Mini Program

`mini-program/` 负责：

- 微信小程序页面与交互
- 小程序端登录态、缓存与端适配
- 依赖后端接口完成用户业务流

---

## 8. 核心功能规划

以下模块来自 PRD，是当前项目的核心产品规划范围。

### 8.1 用户与认证模块

负责：

- Web 登录
- 微信小程序登录
- 当前用户信息获取
- 登录身份绑定
- 会话管理

约束补充：

- 后端 `auth` 模块需要同时兼容 Web 与微信小程序两种登录类型
- Web 走 `accessToken + refreshToken` 双 Cookie
- 微信小程序走 Bearer Token
- 微信小程序第一阶段优先开发“微信绑定手机号一键登录”
- 当前已完成 Web 最小登录闭环与 Mini Bearer Token 能力基线

### 8.2 RBAC 与菜单模块

负责：

- 角色管理
- 权限管理
- 菜单管理
- 用户角色分配
- 动态路由所需菜单树下发
- 接口权限鉴权

### 8.3 宠物档案模块

负责：

- 宠物基础资料
- 宠物详情与统计摘要
- 宠物列表管理
- 宠物主人与协作者关系管理

### 8.4 业务记录模块

负责：

- 体重记录
- 饮食记录
- 饮水记录（如启用）
- 疫苗记录
- 就诊记录（可后续扩展）
- 出行记录
- 时间线与摘要聚合

### 8.5 LLM 模块

负责：

- 周报生成
- 实时问答
- 疫苗推荐建议
- 关键风险提示
- 多模型提供商接入与切换

### 8.6 系统配置模块

负责：

- 小程序 Tab 配置
- LLM 模型相关配置
- 通知与开关配置
- 平台参数配置

---

## 9. 多端登录与认证方案

### 9.1 总体策略

统一：

- 用户模型
- 角色与权限计算逻辑
- 登录成功后的 profile 返回结构

分离：

- Web 使用 `accessToken + refreshToken` Cookie 体系
- Mini Program 使用 Bearer Token

### 9.2 Web

当前基线：

- 使用 HttpOnly Cookie 承载 `accessToken` 与 `refreshToken`
- `accessToken` 专门用于当前接口鉴权
- `refreshToken` 不直接参与业务接口鉴权，只用于无感刷新 `accessToken`
- 登录后通过 `/v1/auth/profile` 获取初始化信息
- 当前 Web 请求层已支持 `401 -> /v1/auth/refresh -> 原请求重放` 的最小闭环

### 9.3 微信小程序

当前方向：

- `wx.login()` 获取 `code`
- 服务端使用 `code + appid + secret` 换取 `openid + session_key`
- 小程序侧优先使用微信绑定手机号一键登录能力，拿到手机号后完成用户匹配或创建
- 服务端基于业务用户签发 JWT
- 小程序通过 `Authorization: Bearer xxx` 调用接口

当前落地边界：

- Bearer Token 请求模式已经在小程序请求层设计中落地
- 微信平台真实能力尚未接入，手机号一键登录目前仍是明确设计方向，不应写成已完成

### 9.4 统一返回结构

推荐统一返回：

- `user`
- `roles`
- `permissions`
- `menus`

这样 Web 与 Mini Program 都能复用同一套登录后初始化思路。

---

## 10. 关键约束

### 10.1 权限系统约束

- 权限是唯一鉴权依据
- 角色是权限集合
- 菜单不是安全源
- 页面、按钮、接口都挂接权限码
- 最终安全边界在后端 Guard

### 10.2 前端动态路由约束

- 后端只返回 `componentKey`
- 前端本地维护 `componentKey -> Component` 白名单映射
- 禁止后端直接返回页面文件路径
- 固定公共路由，业务区动态生成

### 10.3 数据库约束

- 所有核心业务表必须有 `created_at`、`updated_at`
- 主键统一 UUID
- Prisma 主 `schema.prisma` 仅存放 `datasource`、`generator` 和公共 `enum`
- Prisma 各业务模块按领域拆分为独立 `.prisma` 文件，每个文件只维护本模块 `model`
- Prisma 跨文件定义无需 `import`，由 Prisma 自动合并
- 命名统一 snake_case
- Prisma Schema 变更必须伴随 migration 文件
- 新增非空字段必须有默认值或完整数据迁移方案

### 10.4 API 约束

- 统一前缀 `/v1`
- 统一响应结构 `{ code, message, data, timestamp }`
- 统一分页结构
- 统一错误码策略
- “设置关系”类接口优先使用 `PUT`

---

## 11. 开发阶段建议

### Phase 1：工程基础

- 当前目录基线收敛
- Web / Server / Mini Program 基础工程可运行
- 文档与 `.agents` 规则统一
- 环境与包管理约束收敛
- 多线程协作规范建立
- 已完成

### Phase 2：权限底座

- roles / permissions / menus / user_roles / role_permissions / role_menus
- AuthGuard / PermissionGuard
- `/auth/profile`
- 后台角色、菜单、权限配置能力

当前进度：

- 已完成最小 auth2 基线：
  - 服务端已接入 Prisma、PostgreSQL、Redis、DTO 校验和双端认证兼容
  - Web 已完成双 Cookie 登录闭环
  - Mini 已完成 Bearer Token 请求层基线
- 完整 RBAC 管理后台、菜单树配置、角色权限维护仍未完成

### Phase 3：核心业务

- pets
- weight_logs
- food_logs
- vaccine_records
- trip_records
- 基础 Dashboard
- 基础时间线

### Phase 4：增强功能

- 系统配置
- LLM 周报与问答
- 图片上传
- 小程序接入深化
- 大屏需求预研

---

## 12. 文档组织约束

项目文档分为两类：

- `docs/project/`：项目级设计、约束、流程、环境说明
- `docs/features/`：按功能和端拆分的交付文档

`docs/features/` 必须遵循当前仓库约定：

```txt
docs/features/
  server/
  web/
  min-program/
```

每个功能文档按端落到各自目录中，不混放。

---

## 13. 文档间关系

- 本文档定义整体约束、产品范围与技术规划
- 权限与认证细节见 `docs/project/rbac-design.md`
- 前端实现规范见 `docs/project/frontend-architecture.md`
- Web 主题系统设计见 `docs/project/theme-design.md`
- 后端实现规范见 `docs/project/backend-architecture.md`
- 数据库模型见 `docs/project/database-design.md`
- 环境与本地开发约束见 `docs/project/environment-setup.md`
- Git 分支与 worktree 规则见 `docs/project/git-branch-workflow.md`

---

## 14. 当前结论

1. 当前项目以 `petory-server/`、`petory-web/`、`mini-program/` 作为真实协作目录。
2. 当前仓库不是 monorepo，也未接入 workspace 体系。
3. `auth2` 已经把环境变量、Web 双 Cookie、Mini Bearer Token、Prisma、PostgreSQL、Redis 等认证基线真正接入到项目中。
4. PRD 中的产品模块、技术选型和多端策略已纳入本文档，但仍必须区分“规划”与“已落地”。
5. Web 与 Server 当前通过接口契约协作，不依赖源码互引。
6. Mini Program 共仓管理，但不参与跨端运行时代码共享。
7. 权限系统采用 `User -> Role -> Permission` 的设计方向，当前只完成了登录所需的最小查询与返回。
8. Web 使用 `accessToken + refreshToken` Cookie 方向，小程序使用 Bearer Token 方向。
9. 后续所有专项文档若与当前仓库结构冲突，应以当前真实目录和本文档修正后的结论为准。
