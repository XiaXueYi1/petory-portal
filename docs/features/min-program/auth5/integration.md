# Mini Auth5 Integration

## 页面流转

1. 打开小程序后，若本地已有 token，则直接进入首页。
2. 没有 token 时，进入登录页。
3. 用户输入手机号。
4. 点击登录时，前端实时获取一份新的 `Taro.login()` code。
5. 前端提交 `phone + code` 给后端。
6. 登录成功后把 token 存入本地。
7. 跳转到首页。

## 页面约定

- `src/pages/login/index.tsx` 负责真实登录页
- `src/pages/index/index.tsx` 负责真实首页承接
- `src/app.ts` 负责启动时的 token 跳转判断
- 继续使用 Taro 页面路由

## 已知限制

- 首页目前只做最小承接
- 仍不引入 `react-router`
- 不扩展宠物、记录、设置等业务模块
