# Server Foundation

## 目标

完成 `petory-server/` 的首轮本地基础搭建，重点把 `src/common/` 的公共骨架补齐到可扩展状态，方便后续接入鉴权、统一响应、异常处理和请求辅助能力。

## 当前范围

- 仅处理后端本地开发基础能力
- 不接入 Prisma、PostgreSQL、Redis、RBAC、鉴权或业务模块
- 保持当前可扩展目录骨架：
  - `src/common/`
  - `src/infra/`
  - `src/modules/`

## 本轮产出

- 新增 `src/common/constants/`，承载应用名、`/v1` 前缀和基础 HTTP 常量
- 新增 `src/common/decorators/`，预留 `Public` 和 `Permissions` 装饰器
- 新增 `src/common/guards/`，预留 `AuthGuard` 和 `PermissionGuard`
- 新增 `src/common/interceptors/`，预留统一响应包装
- 新增 `src/common/filters/`，预留全局异常过滤
- 新增 `src/common/pipes/`，预留字符串归一化管道
- 新增 `src/common/dto/`，预留统一响应和分页类型
- 新增 `src/common/utils/`，补齐基础纯函数工具
- 新增 `src/common/exceptions/`，补齐业务异常基类

## 当前状态

- 工程已使用 `pnpm` 完成依赖安装
- `pnpm run lint` 已通过
- `pnpm exec jest --runInBand` 已通过
- `src/main.ts` 已修正默认模板中的悬空 Promise warning
- `pnpm run start:dev` 待手动验证
- `src/common/` 已从占位目录升级为真实公共骨架目录

## 协作约定

- 开发阶段默认不主动执行额外构建类命令
- 不保留临时日志文件，过程记录统一写入文档
- 当前只补公共能力骨架，不把数据库、RBAC 或鉴权真实实现提前接入到启动链路里
- 当前 Windows 环境下 `pnpm test` 默认 worker 模式会触发 `spawn EPERM`，测试校验改用 `pnpm exec jest --runInBand`

## 已知限制

- 当前仍是 NestJS 默认示例骨架，尚未进入业务开发
- 安装和命令校验依赖管理员权限环境执行 `pnpm`
- 服务启动联通性与端口监听待手动验证
