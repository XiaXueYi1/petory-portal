# Changelog

- 初始化 `petory-server/` 基础目录骨架
- 使用 `pnpm` 完成后端依赖安装
- 执行 `pnpm run lint`，结果通过
- 执行 `pnpm test`，结果通过
- 修正 `src/main.ts` 中 `bootstrap()` 的悬空 Promise warning，改为 `void bootstrap()`
- `pnpm run start:dev` 留待手动启动验证
- 开发过程不保留临时日志文件，结果统一记录在文档中
- 当前阶段不涉及业务功能与远程仓库接入
