# auth4 - Server Overview

## 目标

在当前 `auth2/auth3` 基线之上，收敛服务端认证策略：

- Web 端使用 `phone + password`
- Mini 端使用 `phone + appCode(code)`
- Web 保持双 Cookie 鉴权
- Mini 使用长效 Bearer Token

## 本轮范围

- 调整 Web 登录 DTO、服务逻辑与查询逻辑为手机号密码登录
- 调整 Mini 登录链路为 `phone + code`
- 服务端使用微信 `code` 换取 `openid + session_key`
- 首次 Mini 登录按 `phone + openid` 完成绑定或自动注册
- 后续 Mini 登录按手机号命中已绑定 `openid` 后重新签发 token
- 同步更新本轮接口文档与变更记录

## 当前实现结论

- `POST /v1/auth/login`
  - 用于 Web 管理端登录
  - 请求参数收敛为 `phone + password`
- `POST /v1/auth/wechat-mini/login`
  - 用于 Mini 登录
  - 请求参数为 `phone + code`
  - `code` 是小程序端通过 `wx.login()` 获取的临时 `appCode`
- 微信登录服务端职责收敛为：
  - 使用 `code + appid + secret` 换取 `openid + session_key`
  - 不再依赖微信手机号一键授权接口作为当前默认方案
- Mini 首次登录：
  - 通过手机号匹配不到已绑定的 Mini 身份时自动注册用户
  - 默认生成随机昵称
  - 默认空头像
- Mini 后续登录：
  - 只要手机号能命中已绑定 `openid`，即可继续重新签发 token
- Mini token：
  - 使用 Bearer Token
  - 有效期延长到至少 7 天
  - 当前不强制要求 refresh token 闭环

## 数据约束

- 本轮未新增 Prisma 表，也未新增字段
- 继续使用：
  - `users.phone` 作为手机号主体信息
  - `user_auth_identities` 存储登录标识绑定关系
- Web 登录标识：
  - 使用手机号身份记录
- Mini 长期绑定标识：
  - 使用 `openid`
- `appCode(code)`：
  - 仅作为微信会话交换的临时凭证
  - 不作为长期登录标识入库

## 已知限制

- 当前默认管理员与开发注册能力仍服务于本地开发验证
- Mini 旧版“微信手机号一键授权”方案仍保留在历史文档中，但本轮不是默认实现
- 本轮未扩展 RBAC、菜单或业务模块联动能力
