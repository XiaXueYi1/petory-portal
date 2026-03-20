# Web 前端架构文档

## 1. 文档目标

本文档说明 `petory-web/` 的当前结构、现状、推荐演进方向以及与其他端的边界。

本文档已整合 `docs/project/fa.md` 的技术栈与实现规划内容，但架构现状仍以当前仓库真实状态为准。

---

## 2. 当前状态

Web 真实工程目录为 `petory-web/`，当前已从官方 Vite React TypeScript 模板演进到 auth2 基线阶段。

当前已确认的现状：

- 使用 React 19
- 使用 Vite 8
- 使用 TypeScript 5
- 已建立 `app / shared / features / pages / layouts` 分层目录
- 已落地基础登录页、应用壳层和最小受保护路由
- 已接入基于 `axios` 的 class 形态请求层
- 已接入 Web Cookie 登录态闭环

因此，本文件既记录当前已落地的 Web 基线，也保留后续演进方向；涉及未完成部分会明确标注。

---

## 3. 技术栈现状与规划

### 3.1 当前已落地

- React
- Vite
- TypeScript
- ESLint
- React Router
- `axios`
- class 形态请求层

### 3.2 规划中的前端技术栈

- Zustand
- TanStack Query
- Ant Design
- Ant Design X
- Tailwind CSS
- 更完整的应用状态、组件和表单体系

说明：上述技术栈来自 `fa.md` 与项目总纲，其中 Router 与基础请求层已在 auth / auth2 阶段落地，其余仍作为落地方向。

---

## 4. 设计原则

1. 路由是业务骨架，不允许随意散落定义。
2. 服务端状态与客户端状态必须分离。
3. 页面模块按 feature 组织，不按技术类型横向堆积。
4. 组件分层明确，页面不可直接污染 shared 层。
5. 动态路由由后端菜单驱动，但页面组件必须由前端本地解析。
6. 新功能优先补齐类型、查询、页面、权限四个层次。
7. 目录结构服务于长期维护，不追求一次性“极致抽象”。

---

## 5. 目录现状与推荐结构

### 5.1 当前目录现状

```txt
petory-web/
├── public/
├── src/
│   ├── app/
│   ├── assets/
│   ├── features/
│   ├── layouts/
│   ├── pages/
│   ├── shared/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### 5.2 推荐演进结构

```txt
petory-web/src/
├── app/
│   ├── providers/
│   ├── router/
│   ├── store/
│   ├── styles/
│   └── bootstrap/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── utils/
│   ├── constants/
│   ├── types/
│   └── permissions/
├── features/
│   ├── auth/
│   ├── pets/
│   ├── health/
│   ├── vaccines/
│   ├── trips/
│   ├── ai/
│   └── system/
├── pages/
│   ├── dashboard/
│   ├── pets/
│   ├── health/
│   ├── vaccines/
│   ├── trips/
│   ├── ai/
│   ├── system/
│   ├── login/
│   ├── 403/
│   └── 404/
├── layouts/
├── main.tsx
└── vite-env.d.ts
```

---

## 6. 分层说明

### 6.1 app 层

负责应用级装配：

- Router 初始化
- Provider 注册
- QueryClient
- Theme Provider / Theme 同步
- 全局样式
- 启动流程

app 层不写业务逻辑。

### 6.2 shared 层

存放全局复用能力：

- 通用组件
- 通用 hooks
- 请求基础能力
- 权限辅助方法
- 常量与纯工具函数

shared 层不能引用 feature / page 层。

### 6.3 features 层

按业务域封装能力：

- API hooks
- feature 内专用组件
- DTO 转换与业务适配
- feature 内 store（如确有必要）

features 层是前端业务实现主力层。

### 6.4 pages 层

页面级入口目录。

每个页面目录建议包含：

```txt
pages/system/config/
├── index.tsx
├── page.tsx
├── components/
└── form.ts
```

规则：

- `index.tsx` 只导出页面入口
- 页面主要逻辑放 `page.tsx`
- 页面专属组件放 `components/`
- 页面表单配置、归一化逻辑可放 `form.ts`

### 6.5 layouts 层

负责：

- 主布局
- 侧边栏
- 顶部导航
- 面包屑
- 内容区壳层

---

## 7. 状态管理约束

### 7.1 Zustand 职责

Zustand 只存以下内容：

- 当前用户
- 角色数组
- 权限数组
- 菜单树
- 当前宠物 ID
- 布局态
- 主题态
- UI 瞬时状态（如侧栏折叠）

不允许把以下内容长期放 Zustand：

- 宠物列表详情
- 系统配置实体数据
- 角色列表
- 菜单列表
- 后端统计数据

这些属于服务端状态，应交给 Query。

### 7.2 推荐 Store 划分

```txt
app/store/
├── auth.store.ts
├── pet.store.ts
├── ui.store.ts
└── theme.store.ts
```

### 7.3 React Query 约束

React Query 负责：

- 登录后 profile
- 宠物列表与详情
- 各类记录列表
- 菜单树
- 角色列表
- 系统配置
- 统计图表数据

Query Key 统一用工厂函数，避免硬编码字符串。

强制规则：

- 涉及当前宠物上下文的数据，`queryKey` 必须包含 `currentPetId`
- 切换宠物后，依赖宠物上下文的 query 必须自动刷新
- 每个 mutation 必须明确失效哪些 query
- 不允许提交成功后依赖手工刷新页面同步状态

---

## 8. 路由与动态菜单设计

### 8.1 固定路由

固定存在：

- `/login`
- `/403`
- `/404`
- `/`

### 8.2 动态业务路由

业务路由由后端返回的 `menus` 动态生成。

后端返回字段至少包含：

- `path`
- `name`
- `componentKey`
- `permissionCode`
- `children`

### 8.3 页面组件映射

前端必须维护白名单映射：

```ts
export const pageModules = {
  DashboardPage: lazy(() => import('@/pages/dashboard')),
  PetListPage: lazy(() => import('@/pages/pets/list')),
  SystemConfigPage: lazy(() => import('@/pages/system/config')),
}
```

禁止：

- 直接根据数据库路径 import
- 在任意页面自行注册业务路由

### 8.4 路由生成流程

```txt
应用启动
 -> 校验登录态
 -> 获取 profile
 -> 写入 authStore
 -> 过滤可访问菜单
 -> componentKey 映射组件
 -> 生成动态路由
 -> 渲染 Layout
```

---

## 9. 权限控制方式

### 9.1 页面级

页面路由需要 `permissionCode`。

无权限时跳转 `/403`。

### 9.2 按钮级

统一使用：

- `Permission` 组件
- 或 `usePermission` Hook

### 9.3 菜单级

菜单展示必须同时满足：

- 后端返回该菜单
- 当前用户拥有菜单要求的权限

---

## 10. 页面、模块与表单开发规范

### 10.1 新增页面时必须做的事情

新增一个业务页面时，必须同时完成：

1. 新建页面目录
2. 在 `pageModules` 注册 `componentKey`
3. 在后端菜单数据中配置菜单项
4. 配置页面权限码
5. 补齐页面所需 query / mutation
6. 补齐类型定义

### 10.2 Feature 目录规范

```txt
features/pets/
├── api/
│   ├── keys.ts
│   ├── queries.ts
│   └── mutations.ts
├── components/
├── hooks/
├── types.ts
└── utils/
```

### 10.3 表单约束

- 表单默认使用 Ant Design Form
- 校验默认使用 Ant Design `rules`
- 可复用表单规则下沉到 `features/<domain>/form-rules/`
- 后端 DTO 与前端表单字段命名尽量一致
- 提交前必须做输入归一化

不建议：

- 零散使用 `useState` 拼表单
- 多页面重复写同样校验规则
- 组件内部偷偷做请求提交而不暴露 mutation 状态

---

## 11. UI、请求层与扩展约束

### 11.1 组件分层

- `shared/components`：纯通用组件
- `features/*/components`：领域组件
- `pages/*/components`：页面专属组件

### 11.2 样式约束

- 优先使用 Antd 组件承载交互
- Tailwind 负责布局与轻样式增强
- 主题 tokens 以应用级主题模块为唯一源头
- 不允许大量零散内联 style
- 不允许同类页面出现多种不一致交互模式

主题系统专题设计见 `docs/project/theme-design.md`。

### 11.3 请求层约束

建议位置：

```txt
shared/lib/request/
├── client.ts
├── types.ts
├── interceptors.ts
└── unwrap.ts
```

职责：

- 统一 baseURL
- 统一错误处理
- 统一凭据策略
- 统一响应解包
- 统一 401 处理

Web 的 request 层不与小程序共享。

当前已落地：

- 请求层已采用 class 形态 `http`
- 支持泛型调用形式，如 `http.post<ResultType>(...)`
- 默认携带 Cookie 凭据
- 遇到 `401` 时会尝试调用 `/v1/auth/refresh` 并重放原请求
- 当前不在前端持久化 bearer token

### 11.4 大屏扩展建议

如果后续有大屏：

- 作为独立页面域放在 `pages/display/`
- 图表与展示组件抽到 `features/display`
- 不要污染普通后台路由结构
- 权限单独定义，如 `dashboard_display:read`

---

## 12. 与其他端的边界

Web 端边界约束如下：

- 不直接引用 `petory-server/` 或 `mini-program/` 源码
- 通过 HTTP API 与后端联调
- Web 内部共享代码仅服务于 Web 本端
- 当前不默认建立跨端共享包

---

## 13. 前端开发检查清单

每次新增功能前检查：

1. 是否已经定义对应权限码
2. 是否需要菜单项
3. 是否需要页面级权限
4. 是否需要按钮级权限
5. 是否需要 queryKey 工厂
6. 是否需要独立表单配置
7. 是否应放入 feature 层复用
8. 是否会影响 `currentPetId` 维度缓存

---

## 14. 当前结论

1. `petory-web/` 是独立前端工程，不在 monorepo 中。
2. 当前已经完成登录页、基础应用壳层和 Web auth2 闭环，不再是纯模板页状态。
3. 文档已整合 `fa.md` 的技术栈与实现规划，其中未落地部分仍不应写成已完成能力。
4. 前端正式采用 `app / shared / features / pages / layouts` 分层方向。
5. 基础请求层已经落地为 class 形态 `axios` 客户端，后续应在此基础上继续收敛。
6. Zustand 只管理会话态与 UI 态，React Query 管服务端状态。
7. 主题系统属于应用级能力，推荐落在 `app/theme/`，并与 `AppProviders`、`app/styles/` 配合落地。
8. 动态路由由后端菜单驱动，页面组件由前端 `componentKey` 白名单映射解析。
9. 新功能应按“类型 -> query -> 页面 -> 权限”闭环补齐。
