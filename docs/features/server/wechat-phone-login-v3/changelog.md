# Wechat Phone Login V3 Changelog

## 本轮新增

- 将 `POST /v1/auth/wechat-mini/login` 从预留接口改为真实登录接口
- 新增 mini 手机号一键登录 DTO 字段 `phoneCode`
- 新增微信小程序适配服务，负责：
  - `code -> openid + session_key`
  - `phoneCode -> phoneNumber`
- 新增或扩展 auth repository 的 mini 用户绑定能力
- 新增 `petory-server/src/modules/auth/wechat-mini-auth.service.ts`

## 本轮修改

- `AuthController` 现在把 mini 登录请求传给真实实现
- `AuthService` 现在支持 mini 手机号一键登录并返回 Bearer Token
- `AuthModule` 已注入微信小程序适配服务
- `UserAuthIdentity` 继续作为微信小程序身份绑定入口
- `petory-server/tsconfig.json` 已增加 `@/*` 路径别名
- `petory-server/package.json` 的 Jest 配置已增加别名映射
- `petory-server/src` 下导入路径已从长相对路径统一为 `@/` 前缀

## 依赖环境

- `WECHAT_MINI_APP_ID`
- `WECHAT_MINI_APP_SECRET`
- PostgreSQL
- Redis

## 校验结果

- `pnpm exec tsc --noEmit`：通过
- `pnpm run lint`：通过
- `pnpm exec jest --runInBand`：通过
- Nest 启动烟测：通过（`BOOT_OK`）

## 当前限制

- 需要微信平台真实可用的 appid / secret / phoneCode 才能完成真链路登录
- 当前不做模拟微信接口兜底
- 当前仍不包含完整 RBAC 管理能力
- 路径别名约束还未同步到主分支项目级文档，需在合入 master 后补齐
