# Web Foundation Integration

当前阶段仅完成基础环境、别名、最小入口和目录预留，暂无业务联调内容。

## 当前说明

- Web 端已完成 `pnpm` 依赖安装
- 已补齐 `react-router-dom`、`zustand`、`@tanstack/react-query`、`antd`、`tailwindcss`
- 已完成 `pnpm run lint`
- `pnpm run dev` 待手动启动验证
- `pnpm run build` 改为按需执行，不作为开发阶段默认检查项

## 联调状态

- 本轮未接入后端接口
- 未建立字段映射、请求时序、登录态处理或缓存策略
- 当前路由仅为单根入口壳层，不是业务路由流
- 后续进入真实业务开发后，再补充联调说明
