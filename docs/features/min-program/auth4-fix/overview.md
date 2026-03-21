# Mini Auth4 Fix Overview

## 目标

把 mini 端 auth4 从调试承接页收口为真实可用的登录页，并在登录成功后跳转首页。

## 范围

- 保留 `phone + appCode(code)` 登录方式
- 将登录页调整为正式可用的入口页面
- 补一个最小首页承接页
- 登录成功后使用 Taro 页面路由跳转到首页
- 不引入 `react-router`

## 当前结论

- mini 端仍然只处理登录相关内容
- 不扩展宠物、记录或其他业务模块
- 登录成功后 token 本地保存
- 后续请求继续自动携带 `Authorization: Bearer <token>`

## 已知限制

- 仍然不做 refresh 页面逻辑
- 当前首页只做最小承接，不做完整业务首页
- 历史 auth4 文档继续保留
