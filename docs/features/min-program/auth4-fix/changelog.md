# Mini Auth4 Fix Changelog

## 本轮变更

- 登录页从调试承接页收口为正式登录页
- 补充首页承接页 `pages/index/index`
- App 启动时根据本地 token 自动决定跳转登录或首页
- 登录成功后跳转首页

## 已知限制

- 不引入 `react-router`
- 不扩展业务模块
- 首页仅做最小承接
