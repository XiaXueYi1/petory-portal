# Changelog

- 新增 `petory-web/.env.dev`
- 新增 `petory-web/.env.prod`
- 新增 `src/shared/config/env.ts`，统一读取 Web 环境变量
- 新增 `src/vite-env.d.ts`，补齐 `ImportMetaEnv` 类型
- 安装 `axios`，仅作为 auth2 请求层升级所需的新依赖
- 把请求层从简易 `fetch` helper 升级为 class 形态 `HttpClient`
- 请求方法改为统一对象入参：
  - `url`
  - `payload`
  - `options`
- 新增自动解包响应、统一 `ApiError`、401 自动 refresh 与请求重放能力
- 新增公共取消请求能力：
  - `options.signal`
  - `http.createAbortController()`
- `auth` API 现按 Web 契约通过请求头提交 `x-client-type: web`
- 登录页文案与信息块更新为 auth2 语义：
  - 双 Cookie
  - profile bootstrap
  - 不持久化 bearer token
- 临时首页文案同步为 auth2 验证闭环

## 已知限制

- 这轮只做最小 auth2 闭环，没有铺完整后台业务
- refresh 逻辑依赖后端 `/auth/refresh` 真正可用
- 当前仍未补多标签页会话同步

