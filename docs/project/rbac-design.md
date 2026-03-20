# RBAC / 菜单 / 动态路由 / 登录兼容设计文档

## 1. 文档目标

本文档记录项目在权限、菜单、登录态与动态路由方面的目标设计。

需要明确：当前仓库中这些能力还没有真正落地，本文件用于统一后续设计方向，不能视为当前实现说明。

---

## 2. 当前落地状态

目前代码层面可确认的现状如下：

- `petory-server/` 还没有认证模块
- `petory-server/` 还没有 RBAC 模块
- `petory-web/` 还没有路由系统和权限系统
- `mini-program/` 还没有登录流与业务态管理

因此，以下内容均属于规划设计。

---

## 3. 设计原则

1. `Permission` 是后端鉴权的最终依据。
2. `Role` 是 `Permission` 的集合。
3. `Menu` 是导航与路由配置，不是安全边界。
4. 前端权限控制只做体验增强，不能代替后端鉴权。
5. Web 与小程序可以采用不同会话承载方式，但用户、角色、权限模型应尽量统一。
6. 动态页面解析必须通过前端本地白名单映射，不直接信任后端返回源码路径。

---

## 4. 目标模型

关系模型建议如下：

```txt
User -> UserRole -> Role -> RolePermission -> Permission
Role -> RoleMenu -> Menu
Menu -> PermissionCode
Page -> PermissionCode
Button -> PermissionCode
API -> PermissionCode
```

---

## 5. 登录兼容策略

### 5.1 Web

建议方案：

- 使用 Cookie 或服务端会话
- 登录后通过 `GET /auth/profile` 获取初始化信息

### 5.2 Mini Program

建议方案：

- 使用 `wx.login()` 获取 `code`
- 后端换取身份信息后签发业务 token
- 小程序通过 `Authorization` 请求接口

### 5.3 统一返回结构

建议登录成功或初始化时统一返回：

- `user`
- `roles`
- `permissions`
- `menus`

---

## 6. 动态路由设计

Web 端如果要做动态路由，建议采用：

- 后端返回 `menus`
- 后端返回 `componentKey`
- 前端本地维护 `componentKey -> page component` 映射
- 未命中映射时回退到兜底页面

禁止让后端直接返回前端源码路径，例如：

```json
{
  "component": "@/pages/system/config/index.tsx"
}
```

原因：

- 构建不可控
- 重构成本高
- 安全边界不清晰

---

## 7. 后端权限控制方向

后端建议拆分为两层：

- `AuthGuard`：解决“你是谁”
- `PermissionGuard`：解决“你能做什么”

接口层以权限码声明访问要求，例如：

```ts
@Permissions('system_config:update')
@Patch('/system-configs/:key')
updateConfig() {}
```

---

## 8. 前端权限控制方向

前端建议覆盖三层：

- 页面访问控制
- 按钮显示或禁用控制
- 菜单显示控制

但前端控制只用于用户体验，不构成最终安全策略。

---

## 9. 当前结论

1. RBAC、菜单、动态路由和登录兼容目前都还未在代码中落地。
2. 本文档应被视为后续实现的设计稿。
3. 后续实现时，必须同步把“已完成部分”写回 `docs/features`，避免项目文档继续只停留在设计层。
