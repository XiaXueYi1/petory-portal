# Mini Program Auth4 Integration

## 登录流程

1. 用户在登录页输入手机号。
2. 用户点击登录按钮。
3. 前端调用 `Taro.login()` 获取一份新的 `code`。
4. 前端把 `phone + code` 发给后端登录接口。
5. 后端返回 `accessToken` 和用户资料。
6. 前端把 `accessToken` 存到本地。
7. 后续请求自动带上 `Authorization: Bearer <token>`。
8. token 失效后，用户回到登录页重新登录。

## 请求约定

- 请求层继续使用 class 形式的 `miniHttp`
- 登录请求使用 `auth: false`
- mini 端请求头继续注入 `x-client-type: mini-program`
- token 存储 key 继续走 mini env 配置

示例请求体：

```json
{
  "phone": "13800138000",
  "code": "wx-login-code"
}
```

## 环境变量

本轮保持 Taro 官方 env mode：

- `.env.development`
- `.env.production`

auth4 相关默认值：

- `TARO_APP_LOGIN_STRATEGY=phone-appcode`
- `TARO_APP_WECHAT_PHONE_LOGIN_STATUS=auth4-ready`

## 已知限制

- mini 端不做 refresh 流程
- 登录时必须现取新的 `Taro.login()` code
- 当前实现只覆盖 mini 登录页，不扩展业务首页
- 历史的一键授权文档保留，但不作为当前默认实现

