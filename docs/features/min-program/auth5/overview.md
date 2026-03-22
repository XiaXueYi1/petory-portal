# Mini Auth5 Overview

## 目标

把 mini 端从 auth4-fix 的临时承接页进一步收口为真实登录体验，并保持 `phone + appCode(code)` 登录闭环可用。

## 范围

- 登录页改成正常产品化页面
- 首页改成正常承接页，不再保留临时说明风格
- 登录成功后自动跳转首页
- 继续使用 Taro 页面路由，不引入 `react-router`
- 只处理 mini 登录闭环，不扩展业务模块

## 当前结论

- mini 仍然使用 `phone + appCode(code)` 登录
- 登录成功后 token 存本地
- 启动时如果本地已有 token，则直接进入首页
- 首页只做最小承接，后续再扩宠物档案、记录和提醒模块

## 已知限制

- 不做 refresh 页面逻辑
- 不扩展业务首页能力
- 仍然保留历史 auth4 / auth4-fix 文档作为回溯参考
