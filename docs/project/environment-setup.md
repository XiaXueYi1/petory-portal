# 环境配置文档

## 1. 文档目标

本文档记录当前仓库的本地开发环境要求、三端启动方式，以及当前已经落地或仍处于规划中的基础设施。

---

## 2. 仓库环境约束

当前仓库不是 monorepo，因此环境约束如下：

- 不要求在根目录统一安装依赖
- 三端分别在各自目录执行安装和启动命令
- 各端锁文件相互独立
- 不存在根级 `pnpm workspace` 约束

---

## 3. Node 与包管理器

从现有项目文件看，当前仓库三端统一使用 `pnpm` 作为包管理器：

- `petory-server/`：使用 `pnpm`
- `petory-web/`：使用 `pnpm`
- `mini-program/`：使用 `pnpm`

说明：
- 当前仓库不是 `pnpm workspace`，但三端都使用各自目录内的 `pnpm` 独立安装和运行
- 不要在根目录统一安装依赖
- 各端分别维护自己的 `package.json` 与锁文件

---

## 4. 本地安装与启动

### 4.0 首轮初始化约定

当前阶段用于完成本地基础搭建：

- 本轮只处理 `petory-server/` 与 `petory-web/`
- `mini-program/` 暂不调整
- 当前阶段先不接入 Git 远程仓库，也不要求执行分支 / worktree 流程
- 在 Windows 环境下，建议使用“管理员权限 PowerShell”执行依赖安装命令，避免权限、脚本策略或软链接写入问题
- 如果 PowerShell 提示 `pnpm.ps1` 被执行策略拦截，可改用 `cmd /c pnpm ...`，或在管理员 PowerShell 中调整脚本执行策略后再继续
- 开发阶段默认不主动执行 `build`，仅在你明确要求或排查问题时再执行
- 不保留临时日志文件，命令结果与问题统一记录到对应文档中
- 完成本轮后，再进行远程仓库连接和后续 feature 发布

---

### 4.1 Server

目录：`petory-server/`

环境文件：

- `.env.dev`
- `.env.prod`

安装依赖：

```bash
pnpm install
```

开发启动：

```bash
pnpm run start:dev
```

默认监听端口：

- `3000`

### 4.2 Web

目录：`petory-web/`

环境文件：

- `.env.dev`
- `.env.prod`

安装依赖：

```bash
pnpm install
```

开发启动：

```bash
pnpm run dev
```

按需构建：

```bash
pnpm run build
```

### 4.3 Mini Program

目录：`mini-program/`

环境文件：

- `.env.development`
- `.env.production`
- 可选：`.env`、`.env.local`、`.env.development.local`、`.env.production.local`

环境变量规则（按 Taro 官方 `env mode`）：

- 业务侧可在运行时代码中使用的自定义变量必须使用 `TARO_APP_` 前缀
- 平台模式由 `process.env.TARO_ENV` 区分
- 示例文档：
  - `https://docs.taro.zone/docs/env-mode-config`

安装依赖：

```bash
pnpm install
```

开发启动：

```bash
pnpm run dev:weapp
```

按需构建微信小程序：

```bash
pnpm run build:weapp
```

设计与尺寸基线：

- 当前小程序设计稿默认以 `750px` 为主标准
- 样式尺寸优先写 `px`
- 由 Taro 编译期负责转换到小程序端单位
- 只有明确需要跳过转换时才使用 `Px / PX`

---

## 5. 当前已确认的环境现状

当前仓库里可以确认的情况：

- `petory-server/` 已有 Nest 启动、测试和 lint 脚本
- `petory-web/` 已有 Vite 启动、构建和 lint 脚本
- `mini-program/` 已有 Taro 多端构建脚本
- `mini-program/dist/` 已存在构建产物
- `petory-server/` 已接入 `.env.dev / .env.prod`、Prisma、PostgreSQL、Redis 和 auth2 相关配置
- `petory-web/` 已接入 `.env.dev / .env.prod` 和 Web auth2 相关配置
- `mini-program/` 已切换到官方 `.env.development / .env.production`，并接入 mini auth 请求层配置

建议后续将 `mini-program/dist/` 是否纳入版本控制单独确认，并补充仓库规则。

---

## 6. 当前基础设施与环境变量基线

当前已落地：

- PostgreSQL
- Redis
- Prisma
- server / web 仍使用 `.env.dev / .env.prod`
- mini-program 使用 Taro 官方 `.env.development / .env.production`

当前仍未完成：

- 生产环境真实变量填充
- 小程序微信平台真实登录能力
- Prisma migration 正式流程收敛
- 跨端共享类型或共享工具

本地开发环境当前使用的数据库与缓存基线如下：

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/postgres?schema=public"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

当前本地开发数据库基线：

- JDBC URL：`jdbc:postgresql://localhost:5432/postgres`
- Schema：`public`
- Username：`postgres`
- Password：`123456`

说明：
- 以上连接信息仅用于当前本地开发环境记录
- 正式环境连接参数后续应通过独立环境变量管理

当前 auth2 相关约束补充：

- `petory-server/.env.dev` 已包含认证密钥、JWT、数据库、Redis、开发注册密钥等 auth2 所需字段
- `petory-web/.env.dev` 已包含 API baseURL、请求超时、refresh 开关与路径等字段
- `mini-program/.env.development` 已包含 Bearer Token header、超时、登录策略等字段（均为 `TARO_APP_` 前缀）
- `mini-program/.env.production` 当前主要作为占位，不应视为生产可用配置

Taro 平台与模式补充：

- 当前小程序主题和跨端差异处理统一以 `process.env.TARO_ENV` 为正式入口
- 不要解构 `process.env`
- 当前第一目标平台仍是 `weapp`

---

## 7. 当前结论

1. 当前仓库的本地环境是“三端分别安装、分别启动”的模式，且三端统一使用 `pnpm`。
2. 文档中不应再出现根级 `pnpm workspace` 的环境要求。
3. 开发阶段默认不主动执行 `build`，按需再执行。
4. 不保留临时日志文件，过程记录统一写入文档。
5. 数据库、缓存和 ORM 已在 auth2 中完成本地开发接入，但生产配置和 migration 流程仍未完成。
6. 后续新增基础设施时，仍应同步补充每端 `.env` 字段说明和启动前置条件。

---

## 8. 本地开发默认账号

当前本地开发阶段约定默认超级管理员账号如下：

- Username：`admin`
- Password：`123456`

说明：

- 仅用于本地开发和初始化联调
- 正式环境、测试环境不应继续沿用该默认凭据
