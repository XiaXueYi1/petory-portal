# Web Auth5 Changelog

## Added

- 将 Web 登录页从调试说明风格收成真实产品页
- 将首页改成真实登录后承接页
- 明确 Web auth5 只对登录请求中的 `password` 做 `AES-256-GCM` 加密
- 补齐 `docs/features/web/auth5/`

## Updated

- 保持 `phone + password` 登录方式不变
- 保持现有请求层与 Cookie 登录闭环不变
- 登录后直接跳转首页

## Limits

- 不扩展后台业务模块
- 不重做路由架构
- 仍依赖 server 侧登录契约可用
