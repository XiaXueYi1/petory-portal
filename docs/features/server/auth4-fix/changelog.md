# Server Auth4 Fix Changelog

## 本轮新增

- Web 登录 `password` 字段增加 AES-256-GCM 解密支持
- 登录 DTO 放宽为可接收 AES 密文
- mini 首次自动注册后补齐 Web 密码身份

## 本轮修改

- `AuthPasswordService` 新增 Web 登录密码解密能力
- `AuthService.login()` 先解密再验密
- `AuthRepository` 新增 Web 密码身份补齐方法

## 已知限制

- 仅对登录接口里的密码字段处理加解密
- 仍需要 HTTPS
- 不扩展 RBAC 和其他业务模块
