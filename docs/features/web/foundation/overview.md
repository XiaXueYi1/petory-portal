# Web Foundation

## 目标

完成 `petory-web/` 的首轮本地基础搭建，确认 Vite React TypeScript 工程依赖、`@` 别名、最小入口和目录骨架都已收口。

## 当前范围

- 仅处理 Web 本地开发基础能力
- 不接入业务页面、完整业务路由、状态管理流或请求层实现
- 保持当前可扩展目录骨架：
  - `src/app/`
  - `src/shared/`
  - `src/features/`
  - `src/pages/`
  - `src/layouts/`

## 当前状态

- 工程已使用 `pnpm` 完成依赖安装
- 已安装并补齐当前基础技术栈依赖：
  - `react-router-dom`
  - `zustand`
  - `@tanstack/react-query`
  - `antd`
  - `@ant-design/icons`
  - `tailwindcss`
  - `@tailwindcss/vite`
- `@` 别名已在 Vite 和 TypeScript 配置中生效
- 最小入口已切换为 `src/app/App.tsx` + `RootLayout`
- `src/features/` 与 `src/pages/` 已预留最小占位
- `pnpm run lint` 已通过
- `pnpm run dev` 待手动启动验证
- `pnpm run build` 不作为开发阶段默认检查项，按需执行

## 协作约定

- 开发阶段默认不主动执行 `build`
- 不保留临时日志文件，过程记录统一写入文档

## 已知限制

- 当前只接入了最小壳层和基础提供器，没有真实业务页面
- 路由仅保留一个根入口，不接入完整业务路由流
- 未接入后端接口、字段映射、登录态和状态同步
- 开发服务器启动联通性仍待手动验证
