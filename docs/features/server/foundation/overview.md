# Server Foundation

## 目标

完成 `petory-server/` 的首轮本地基础搭建，确认 NestJS 工程依赖可安装、基础目录骨架存在、常用校验命令可执行。

## 当前范围

- 仅处理后端本地开发基础能力
- 不接入 Prisma、PostgreSQL、Redis、RBAC、鉴权或业务模块
- 保持当前可扩展目录骨架：
  - `src/common/`
  - `src/infra/`
  - `src/modules/`

## 当前状态

- 工程已使用 `pnpm` 完成依赖安装
- `pnpm run lint` 已通过
- `pnpm test` 已通过
- `src/main.ts` 已修正默认模板中的悬空 Promise warning
- `pnpm run start:dev` 待手动验证

## 协作约定

- 开发阶段默认不主动执行额外构建类命令
- 不保留临时日志文件，过程记录统一写入文档

## 已知限制

- 当前仍是 NestJS 默认示例骨架，尚未进入业务开发
- 安装和命令校验依赖管理员权限环境执行 `pnpm`
- 服务启动联通性与端口监听待手动验证
