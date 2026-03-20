# Changelog

- 初始化 `petory-server/` 基础目录骨架
- 使用 `pnpm` 完成后端依赖安装
- 执行 `pnpm run lint`，结果通过
- 执行 `pnpm exec jest --runInBand`，结果通过
- 修正 `src/main.ts` 中 `bootstrap()` 的悬空 Promise warning，改为 `void bootstrap()`
- 新增 `src/common/constants/`，补齐应用名、API 前缀和 HTTP 常量
- 新增 `src/common/decorators/`，预留 `Public` 和 `Permissions` 装饰器
- 新增 `src/common/guards/`，预留 `AuthGuard` 和 `PermissionGuard`
- 新增 `src/common/interceptors/`，预留统一响应包装
- 新增 `src/common/filters/`，预留全局异常过滤
- 新增 `src/common/pipes/`，预留字符串归一化管道
- 新增 `src/common/dto/`，补齐统一响应和分页类型
- 新增 `src/common/utils/`，补齐基础纯函数工具
- 新增 `src/common/exceptions/`，补齐业务异常基类
- `pnpm run start:dev` 留待手动启动验证
- 开发过程不保留临时日志文件，结果统一记录在文档中
- 当前 Windows 环境下 `pnpm test` 默认 worker 模式会触发 `spawn EPERM`，因此测试校验使用 `pnpm exec jest --runInBand`
- 当前阶段不涉及业务功能与远程仓库接入
