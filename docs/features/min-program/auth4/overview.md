# Mini Program Auth4 Overview

## 目标

本轮把 mini 端登录正式收敛为 `phone + appCode(code)` 登录，并继续使用长效 Bearer Token。

当前默认路径适用于个人主体小程序，不再把微信手机号一键授权作为主实现。

## 范围

- 登录页改为手机号输入
- 点击登录时现取 `Taro.login()` 的新 `code`
- 提交 `phone + code` 给后端
- 登录成功后把 Bearer Token 写入本地
- token 失效后回到登录页重新登录
- 保持 Sass 基线，不引入新的样式体系

## 当前策略

- 登录入参：`phone + code`
- 请求鉴权：`Authorization: Bearer <token>`
- 登录请求不附带 token
- mini 端不做 refresh 页面逻辑
- 首次登录由服务端自动注册时，会同步补齐 Web 可登录的默认密码身份
- 当前开发阶段默认初始密码为 `123456`

## 说明

- mini 端仍然只输入手机号，不输入密码
- 首次自动注册完成后，用户可使用同手机号和默认密码登录 Web
- 历史上的微信手机号一键授权文档仍然保留在 `docs/features/min-program/wechat-phone-login-v3/`
- 那份文档属于历史参考，不是 auth4 的默认实现路径
- 当前 auth4 页面仍偏调试态，后续 `auth4-fix` 需要替换为真实主题登录页并在登录后跳转首页
