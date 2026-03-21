# Mini Program Auth4 Overview

## 目标

本轮把 mini 端登录正式收敛为 `手机号 + appCode(code)` 登录，并继续使用长效 Bearer Token。

当前默认路径适用于个人主体小程序，不再把微信手机号一键授权作为主实现。

## 范围

- 登录页改为手机号输入
- 点击登录时现取 `Taro.login()` code
- 提交 `phone + code` 给后端
- 登录成功后把 Bearer Token 写入本地
- token 失效后回到登录页重新登录
- 保持 Sass 基线，不引入新的样式体系

## 当前策略

- 登录入参：`phone + code`
- 请求鉴权：`Authorization: Bearer <token>`
- 登录请求不附带 token
- mini 端不做 refresh 页面逻辑

## 说明

历史上的微信手机号一键授权文档仍然保留在 `docs/features/min-program/wechat-phone-login-v3/`。

那份文档属于历史参考，不是 auth4 的默认实现路径。

