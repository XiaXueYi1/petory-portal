# Mini Auth4 Fix Integration

## 页面流转

1. 打开小程序后，若本地已有 token，则直接跳转首页。
2. 若没有 token，则进入登录页。
3. 登录页输入手机号并提交。
4. 前端现取 `Taro.login()` 的新 `code`。
5. 前端提交 `phone + code` 给后端。
6. 登录成功后写入本地 token。
7. 页面跳转到首页。

## 页面约定

- `src/pages/login/index.tsx` 只保留登录体验
- `src/pages/index/index.tsx` 只做最小首页承接
- App 启动时根据 token 决定进入登录页还是首页
- 仍然使用 Taro 页面路由，不使用 `react-router`

## 已知限制

- 首页只是承接页，不是完整业务首页
- 登录后只做最小跳转闭环
