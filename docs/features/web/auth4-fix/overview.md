# Web Auth4 Fix Overview

## 目标

把 Web 端 `auth4` 从调试态收口成真实可用的登录体验。

## 范围

- 登录页保留 `phone + password`
- 仅对登录请求中的 `password` 做 AES-256-GCM 加密
- 使用固定开发密钥：
  - `VITE_AUTH_PASSWORD_AES_KEY_BASE64`
  - `VITE_AUTH_PASSWORD_AES_IV_BASE64`
- `dev` 和 `prod` 两套环境都需要同样的值
- 登录成功后跳转首页
- 首页作为最小承接页，不扩展业务模块

## 当前状态

- 登录页已从调试说明风格改为实际登录页
- `password` 在提交前会先加密
- 登录后会进入首页壳层
- 请求层仍保持 class 形态和 Cookie 认证闭环

## 已知限制

- 只处理登录请求里的 `password`
- 不改 server / mini
- 不扩展业务页面
