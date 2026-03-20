# Web 前端架构文档

## 1. 文档目标

本文档说明 `petory-web/` 的当前结构、现状、推荐演进方向以及与其他端的边界。

---

## 2. 当前状态

Web 真实工程目录为 `petory-web/`，当前由官方 Vite React TypeScript 模板初始化。

当前已确认的现状：

- 使用 React 19
- 使用 Vite 8
- 使用 TypeScript 5
- 当前页面仍是模板默认演示内容
- 当前还未接入路由、状态管理、请求层或业务模块

因此，本文件中的目录建议属于后续演进方向，不代表仓库里已经存在这些模块。

---

## 3. 技术栈现状

当前已落地：

- React
- Vite
- TypeScript
- ESLint

尚未落地但可以作为规划预留：

- React Router
- Zustand
- TanStack Query
- 请求封装层

---

## 4. 目录现状

当前目录结构大致如下：

```txt
petory-web/
├── public/
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## 5. 推荐演进方向

当 Web 端进入真实业务开发后，推荐逐步演进为如下结构：

```txt
petory-web/src/
├── app/
├── shared/
├── features/
├── pages/
├── layouts/
└── main.tsx
```

建议含义：

- `app/`：应用装配层，如路由、Provider、全局初始化
- `shared/`：Web 端内部共享能力，如请求工具、常量、通用组件
- `features/`：按功能域拆分的业务模块
- `pages/`：路由页面
- `layouts/`：布局骨架

---

## 6. 与其他端的边界

Web 端边界约束如下：

- 不直接引用 `petory-server/` 或 `mini-program/` 源码
- 通过 HTTP API 与后端联调
- Web 内部共享代码仅服务于 Web 本端
- 当前不默认建立跨端共享包

---

## 7. 当前结论

1. `petory-web/` 是独立前端工程，不在 monorepo 中。
2. 当前代码仍是 Vite 模板页，业务页面和应用层基础设施尚未落地。
3. 路由、状态管理、请求层、权限页面等均应视为后续规划，不应在文档中写成已完成能力。
4. 后续 Web 文档需要明确区分“现状”和“推荐结构”。
