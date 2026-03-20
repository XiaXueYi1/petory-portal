# Web Foundation

## 目标

完成 `petory-web/` 的首轮本地基础搭建，确认 Vite React TypeScript 工程依赖可安装、基础目录骨架存在、常用校验命令可执行。

## 当前范围

- 仅处理 Web 本地开发基础能力
- 不接入业务页面、完整路由、状态管理或请求层实现
- 保持当前可扩展目录骨架：
  - `src/app/`
  - `src/shared/`
  - `src/features/`
  - `src/pages/`
  - `src/layouts/`

## 当前状态

- 工程已使用 `pnpm` 完成依赖安装
- `pnpm run lint` 已通过
- `pnpm run dev` 待手动启动验证
- `pnpm run build` 不作为开发阶段默认检查项，按需执行

## 协作约定

- 开发阶段默认不主动执行 `build`
- 不保留临时日志文件，过程记录统一写入文档

## 已知限制

- 当前仍是 Vite React 默认模板页面，尚未进入业务开发
- 命令校验依赖管理员权限环境执行 `pnpm`
- 开发服务器启动联通性待手动验证
