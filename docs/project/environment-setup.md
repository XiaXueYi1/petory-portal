# 环境配置文档

## 1. 文档目标

本文档记录当前仓库的本地开发环境要求、三端启动方式，以及哪些基础设施属于后续规划。

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

---

## 5. 当前已确认的环境现状

当前仓库里可以确认的情况：

- `petory-server/` 已有 Nest 启动、测试和 lint 脚本
- `petory-web/` 已有 Vite 启动、构建和 lint 脚本
- `mini-program/` 已有 Taro 多端构建脚本
- `mini-program/dist/` 已存在构建产物

建议后续将 `mini-program/dist/` 是否纳入版本控制单独确认，并补充仓库规则。

---

## 6. 基础设施规划项

以下内容在项目设计文档中被提到，但当前仓库中还没有真正完成接入：

- PostgreSQL
- Redis
- Prisma
- 统一 `.env` 规范
- 跨端共享类型或共享工具

因此，下面的环境变量只能视为规划示例，不能视为当前可直接运行的既定配置：

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/petory?schema=public"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

## 7. 当前结论

1. 当前仓库的本地环境是“三端分别安装、分别启动”的模式，且三端统一使用 `pnpm`。
2. 文档中不应再出现根级 `pnpm workspace` 的环境要求。
3. 开发阶段默认不主动执行 `build`，按需再执行。
4. 不保留临时日志文件，过程记录统一写入文档。
5. 数据库、缓存和 ORM 仍属于后续建设项。
6. 后续一旦接入真实基础设施，应同步补充每端 `.env` 字段说明和启动前置条件。
