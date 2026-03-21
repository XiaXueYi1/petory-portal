# Web Auth4 Fix Changelog

## Added

- 真实化 `/login` 页面
- 为登录请求中的 `password` 增加 AES-256-GCM 加密发送
- 登录成功后跳转首页
- 增加 `auth4-fix` 文档目录

## Updated

- 首页改为最小可用承接页，不再是调试说明页
- 登录页文案收敛为真实可用登录体验

## Limits

- 只处理登录请求里的 `password`
- 不扩展业务模块
- 不修改 server / mini
