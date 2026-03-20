# RBAC / 菜单 / 动态路由 / 登录兼容设计文档

## 1. 文档目标

本文档用于定义 Petory Portal 的权限体系与登录兼容方案，覆盖：

- 用户、角色、权限、菜单的关系
- Web / 小程序登录兼容策略
- 前端动态路由设计
- 菜单与权限联动方式
- 后端接口鉴权设计
- 实施顺序与开发边界

本文档已整合 `docs/project/rbac-prd.md` 的设计内容，作为 RBAC、菜单、动态路由与登录兼容的主设计文档。

---

## 2. 设计原则

### 2.1 核心原则

1. **Permission 是唯一鉴权依据**
2. **Role 是 Permission 的集合**
3. **Menu 是导航载体，不是安全源**
4. **前端控制只做体验增强，后端鉴权是最终边界**
5. **登录域模型统一，会话承载允许分端实现**
6. **动态页面组件解析权必须保留在前端本地白名单中**

### 2.2 本文档解决的问题

- 用户登录后为什么能看到某个菜单
- 为什么能进入某个页面
- 为什么能看到某个按钮
- 为什么能调用某个接口
- Web 与微信小程序如何统一用户与权限模型
- 动态路由如何既灵活又可控

---

## 3. 核心概念定义

### 3.1 User

系统登录主体。一个用户可以拥有多个角色。

### 3.2 Role

角色是权限集合，用于组织和复用权限。

系统 v1 默认角色：

- `user`
- `vet`
- `admin`

### 3.3 Permission

权限是系统最小鉴权单位，用于：

- 页面访问控制
- 按钮操作控制
- 接口访问控制

### 3.4 Menu

菜单是前端导航配置单元，用于：

- 菜单展示
- 页面入口组织
- 路由树生成

Menu 不承担后端安全职责。

---

## 4. 关系模型

```txt
User -> UserRole -> Role -> RolePermission -> Permission
Role -> RoleMenu -> Menu
Menu -> PermissionCode
Page -> PermissionCode
Button -> PermissionCode
API -> PermissionCode
```

### 4.1 关系解释

#### 用户与角色

- 一个用户可绑定多个角色
- 用户不直接绑定权限

#### 角色与权限

- 角色聚合权限
- 权限是角色可执行操作的事实依据

#### 角色与菜单

- 角色决定一个用户理论上可见的功能区范围
- 菜单只承载 UI 导航层信息

#### 菜单与权限

- 菜单通过 `permission_code` 声明页面访问要求
- 页面访问时仍需检查权限

#### API 与权限

- API 使用权限码进行后端鉴权
- 即使前端隐藏入口，也不能跳过后端 Guard

---

## 5. 为什么 Menu 不能作为权限源

菜单只是界面导航配置，不是安全边界。

原因：

1. 菜单隐藏并不等于接口不可访问
2. 页面可见不等于按钮可操作
3. 一个页面往往对应多个操作权限
4. 安全策略必须与 UI 配置解耦

因此系统明确规定：

- 菜单负责“显示什么”
- 权限负责“能做什么”
- 后端只认权限，不认菜单

---

## 6. 数据模型设计

### 6.1 users

```sql
users
- id
- email
- phone
- nickname
- avatar
- status
- last_login_at
- created_at
- updated_at
```

### 6.2 roles

```sql
roles
- id
- code
- name
- description
- status
- created_at
- updated_at
```

说明：

- `code` 唯一
- 代码中以 `code` 作为角色逻辑标识

### 6.3 permissions

```sql
permissions
- id
- code
- name
- resource
- action
- description
- status
- created_at
- updated_at
```

说明：

- `code` 规范为 `resource:action`
- `resource` 与 `action` 冗余存储，便于搜索与管理

### 6.4 menus

```sql
menus
- id
- parent_id
- code
- name
- path
- component_key
- icon
- sort
- type
- visible
- status
- permission_code
- is_external
- keep_alive
- created_at
- updated_at
```

字段说明：

- `component_key`：前端组件映射标识
- `permission_code`：进入该页面所需基础权限
- `type`：`directory | menu | page`
- `visible`：是否显示在导航中

### 6.5 user_roles

```sql
user_roles
- id
- user_id
- role_id
- created_at
```

### 6.6 role_permissions

```sql
role_permissions
- id
- role_id
- permission_id
- created_at
```

### 6.7 role_menus

```sql
role_menus
- id
- role_id
- menu_id
- created_at
```

### 6.8 user_auth_identities

```sql
user_auth_identities
- id
- user_id
- provider
- provider_user_id
- credential_hash
- created_at
- updated_at
```

用途：

- 兼容邮箱密码登录
- 兼容微信小程序登录
- 兼容后续用户跨端账号绑定

---

## 7. 权限命名规范

### 7.1 命名格式

统一使用：

```txt
resource:action
```

例如：

- `pets:read`
- `pets:create`
- `pets:update`
- `pets:delete`
- `weight_logs:read`
- `weight_logs:create`
- `food_logs:read`
- `vaccines:read`
- `trips:read`
- `users:read`
- `roles:update`
- `menus:update`
- `system_config:update`
- `llm_reports:trigger`

### 7.2 命名原则

- 使用复数资源名或统一资源名
- 动作用固定枚举
- 不使用模糊的 `write` 作为长期唯一写操作表达
- 按钮权限必须对应明确操作语义

### 7.3 推荐 action 枚举

- `read`
- `create`
- `update`
- `delete`
- `trigger`
- `manage`（仅极少数管理型权限）

---

## 8. 默认角色设计

### 8.1 user

普通业务用户。

职责：

- 管理自己宠物
- 维护记录
- 查看疫苗与出行信息
- 使用 LLM 相关功能

推荐权限：

- `pets:*`（实现时展开为独立权限）
- `weight_logs:*`
- `food_logs:*`
- `vaccines:*`
- `trips:*`
- `llm_reports:read`
- `llm_reports:trigger`

### 8.2 vet

医生角色。

职责：

- 查看被授权宠物的数据
- 给出建议或专业意见
- 不拥有平台治理能力

推荐权限：

- `pets:read`
- `weight_logs:read`
- `food_logs:read`
- `vaccines:read`
- `trips:read`
- `llm_reports:read`

说明：

- v1 建议 `vet` 以读权限为主
- 若需要医生批注，可单独增加 `vet_notes:create`

### 8.3 admin

平台管理员。

职责：

- 管理用户、角色、权限、菜单
- 管理系统配置
- 维护平台治理能力

推荐权限：

- `users:*`
- `roles:*`
- `permissions:read`
- `menus:*`
- `system_config:*`

说明：

- `admin` 不天然等于业务医生
- 是否拥有全部宠物业务写权限需单独定义，不能默认继承

本地开发默认超级管理员约定：

- 用户名：`admin`
- 密码：`123456`

说明：

- 以上仅作为当前本地开发阶段的默认超级管理员账号
- 正式环境不得沿用该默认凭据

---

## 9. 菜单设计

### 9.1 菜单的职责

菜单只负责：

- 导航展示
- 页面分组
- 路由树承载
- UI 组织

菜单不负责：

- 核心鉴权
- 接口安全
- 操作按钮控制

### 9.2 菜单与权限的联动规则

一个用户能否看到某个菜单，必须同时满足：

1. 该菜单在角色授权范围内
2. 用户拥有该菜单所要求的 `permission_code`

这意味着：

- `role_menus` 决定“理论菜单集合”
- `permission_code` 决定“页面访问条件”

### 9.3 为什么同时需要 `role_menus` 与 `permission_code`

#### `role_menus` 的价值

- 角色功能导航可配置
- 不同角色可以定制展示结构
- 便于运营和后台配置

#### `permission_code` 的价值

- 页面准入规则可标准化
- 与接口权限统一语义
- 页面、按钮、接口能共享一套权限体系

---

## 10. 登录与认证兼容设计

### 10.1 统一目标

Web 与小程序要统一：

- 用户域模型
- 角色和权限计算
- 登录后初始化流程
- profile 返回结构

### 10.2 Web 认证

方案：

- 使用 HttpOnly Cookie
- Web 端同时维护 `accessToken` 与 `refreshToken`
- `accessToken` 负责当前接口访问
- `refreshToken` 负责续签
- 前端通过 `/auth/profile` 获取用户初始化信息

流程：

```txt
Web 登录
 -> 服务端校验账号
 -> 写入 accessToken / refreshToken Cookie
 -> 前端请求 /auth/profile
 -> 获取 user + roles + permissions + menus
```

### 10.3 微信小程序认证

方案：

- 小程序通过 `wx.login()` 获取 `code`
- 服务端使用 `code + appid + secret` 换取 `openid + session_key`
- 服务端匹配或创建用户
- 服务端签发 Bearer JWT
- 小程序使用 `Authorization` 请求接口

流程：

```txt
wx.login()
 -> code
 -> /auth/wechat-mini/login
 -> 服务端换 openid + session_key
 -> 查询或创建 user
 -> 计算 roles / permissions / menus
 -> 返回 access_token + profile
```

### 10.4 为什么不强行统一为 Cookie

原因：

- 小程序不是标准浏览器环境
- Cookie 兼容能力受端能力限制
- Token 更适合小程序登录态控制
- 会话承载方式不同，不影响统一权限模型

### 10.5 当前推荐的双端认证结论

- Web：`accessToken + refreshToken` 双 Cookie
- Mini Program：Bearer JWT
- 两端统一用户、角色、权限、菜单模型
- 两端统一通过 `/auth/profile` 收敛初始化信息

---

## 11. 登录成功返回结构

推荐接口：

- `GET /auth/profile`
- 或 `GET /me`

推荐返回：

```json
{
  "user": {
    "id": "uuid",
    "nickname": "Tom",
    "avatar": "",
    "email": "tom@example.com"
  },
  "roles": ["admin"],
  "permissions": [
    "users:read",
    "roles:read",
    "roles:update",
    "menus:read",
    "menus:update",
    "system_config:read"
  ],
  "menus": [
    {
      "id": "uuid",
      "parentId": null,
      "code": "system",
      "name": "系统管理",
      "path": "/system",
      "componentKey": "LayoutRoute",
      "permissionCode": "system_config:read",
      "children": []
    }
  ]
}
```

---

## 12. 前端动态路由设计

### 12.1 设计结论

动态路由必须采用：

- 后端返回 `menus`
- 后端返回 `componentKey`
- 前端本地维护白名单映射
- 前端运行时生成业务路由

### 12.2 禁止的方式

禁止后端直接返回页面文件路径，例如：

```json
{
  "component": "@/pages/system/config/index.tsx"
}
```

原因：

- 构建不可控
- 目录重构成本高
- 运行时安全性差
- 无法稳定做静态分析

### 12.3 推荐方式

#### 后端返回

```json
{
  "path": "/system/config",
  "componentKey": "SystemConfigPage"
}
```

#### 前端映射

```ts
export const pageModules = {
  DashboardPage: lazy(() => import('@/pages/dashboard')),
  PetListPage: lazy(() => import('@/pages/pets/list')),
  SystemConfigPage: lazy(() => import('@/pages/system/config')),
}
```

#### 运行时解析

```ts
function resolveComponent(componentKey: string) {
  return pageModules[componentKey] ?? NotFoundPage
}
```

### 12.4 路由生成流程

```txt
登录完成
 -> 获取 profile
 -> 写入 authStore
 -> 根据 menus + permissions 过滤可访问菜单
 -> componentKey 映射页面组件
 -> 生成路由树
 -> 注册业务路由
 -> 渲染 Layout
```

### 12.5 固定路由与动态路由

#### 固定路由

- `/login`
- `/403`
- `/404`
- `/`
- `/auth/callback`（如有）

#### 动态路由

- 所有登录后的业务页面

原则：

- 公共壳路由固定
- 业务功能页动态生成

---

## 13. 页面、按钮、接口的权限控制

### 13.1 页面权限

页面路由项配置 `permissionCode`。

进入页面前必须校验：

- 当前用户是否拥有该权限

没有则跳转 `/403`。

### 13.2 按钮权限

按钮使用统一组件或 Hook 控制，例如：

```tsx
<Permission code="pets:create">
  <Button>新增宠物</Button>
</Permission>
```

适用：

- 新增
- 编辑
- 删除
- 保存系统配置
- 触发 LLM 生成

### 13.3 接口权限

Controller 方法通过装饰器声明所需权限：

```ts
@Permissions('system_config:update')
@Patch('/system-configs/:key')
updateConfig() {}
```

---

## 14. 后端鉴权设计

### 14.1 认证与鉴权分离

#### 认证

解决“你是谁”

例如：

- Cookie 校验
- Token 校验
- 当前用户获取

#### 鉴权

解决“你能做什么”

例如：

- 是否可更新系统配置
- 是否可删除宠物
- 是否可管理角色

### 14.2 Guard 设计

#### AuthGuard

职责：

- 校验登录态
- 解析当前用户
- 把用户挂入 request

#### PermissionGuard

职责：

- 读取接口声明的权限
- 校验用户权限集合
- 不通过则抛出 403

### 14.3 推荐执行顺序

```txt
请求
 -> LoggingInterceptor
 -> AuthGuard
 -> PermissionGuard
 -> ValidationPipe
 -> Controller
```

### 14.4 权限缓存

可选使用 Redis 做权限缓存：

- Key：`rbac:user:{userId}`
- Value：权限码数组
- TTL：10 分钟
- 角色或权限变更时主动失效

---

## 15. 前端状态管理协作

### 15.1 Zustand 负责

- user
- roles
- permissions
- menus
- 登录状态
- 当前布局态 / UI 状态

### 15.2 React Query 负责

- `/auth/profile`
- 角色列表
- 菜单树
- 系统配置
- 宠物列表与明细
- 其他服务端实体数据

原则：

- 服务端状态交给 Query
- 会话与 UI 状态交给 Zustand

---

## 16. 推荐接口设计

说明：所有后端接口统一挂载在 `/v1` 基础前缀下。

### 16.1 认证接口

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/profile`
- `POST /auth/wechat-mini/login`

本地开发阶段默认超级管理员登录凭据：

- username: `admin`
- password: `123456`

### 16.2 角色权限菜单接口

- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `DELETE /roles/:id`

- `GET /permissions`
- `GET /menus/tree`
- `POST /menus`
- `PATCH /menus/:id`
- `DELETE /menus/:id`

- `PUT /users/:id/roles`
- `PUT /roles/:id/permissions`
- `PUT /roles/:id/menus`

---

## 17. 实施顺序建议

### Phase 1：认证基础

- users
- user_auth_identities
- Web 登录
- 小程序登录
- `/auth/profile`

### Phase 2：RBAC 基础

- roles
- permissions
- user_roles
- role_permissions
- AuthGuard
- PermissionGuard

### Phase 3：菜单体系

- menus
- role_menus
- 菜单树接口
- profile 返回菜单树

### Phase 4：前端动态路由

- authStore
- componentKey 映射
- route generator
- Page Guard
- Button Permission 组件

### Phase 5：后台治理

- 用户分配角色
- 角色配置权限
- 角色配置菜单
- 系统配置页

---

## 18. 明确不在 v1 处理的内容

v1 不处理：

- 用户直绑权限
- 复杂 ABAC
- 多租户隔离
- 行级复杂授权引擎
- 菜单 / 按钮 / 接口统一抽象为一棵资源树
- 组织架构权限继承

---

## 19. 最终结论

本项目权限体系正式采用以下结论：

1. `Permission` 是唯一鉴权依据
2. `Role` 是 `Permission` 的集合
3. `Menu` 是导航与路由载体，不是安全源
4. `Role` 同时组织菜单和权限
5. `Page / Button / API` 都通过权限码控制
6. 前端动态路由采用 `componentKey + 本地白名单映射`
7. Web 使用 `accessToken + refreshToken` Cookie，小程序使用 Bearer Token
8. 登录成功后统一返回 `user / roles / permissions / menus`
9. 后端 Guard 是最终安全边界





