# Server Auth4 Fix Overview

## 目标

在 `auth4` 基线之上，补齐服务端登录细节修正：

- Web 登录仍是 `phone + password`
- 仅对 Web 登录接口中的 `password` 字段做 AES-256-GCM 解密支持
- mini 仍是 `phone + appCode(code)`
- mini 首次自动注册时补齐 Web 可登录的手机号密码身份

## 当前约定

- Web 登录密码密文格式：
  - `ciphertextBase64.authTagBase64`
- 开发环境固定值：
  - key: `ciCsw/I6/PwLnqEbZTjt/igEKI3MuP4QTn1rQaWciMo=`
  - iv: `Ea4hK8529EyK70+w`
- 服务端只对登录接口里的 `password` 做解密
- 解密后继续走现有 `scrypt + pepper` 密码比对

## 本轮范围

- 修正 `LoginDto.password` 的长度约束，允许 AES 密文通过 DTO
- 补充 Web 密码解密服务
- mini 首次登录成功后补齐 Web 密码身份
- 本地开发默认密码继续为 `123456`

## 已知限制

- 只覆盖登录接口密码字段，不扩展到其他业务密码输入
- 仍依赖 HTTPS
- 不扩展 RBAC 和业务模块
