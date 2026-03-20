# Web 项目结构约束

适用于 `petory-web/`。

## 推荐结构

```text
petory-web/src/
├── app/
├── shared/
├── features/
├── pages/
├── layouts/
└── main.tsx
```

## 目录判断规则

先问三个问题：

1. 只服务于某个页面？
   放 `pages/`
2. 属于某个业务域，可被多个页面复用？
   放 `features/`
3. 完全通用，和业务域无关？
   放 `shared/`

## `pages` 与 `features`

- `pages/` 负责页面入口、页面编排、页面专属组件和 hooks
- `features/` 负责业务域能力、领域组件、领域 hooks、请求能力和领域类型

## 避免的做法

- 不要把整个业务域都堆进 `pages/`
- 不要让 `features/` 承载页面专属逻辑
- 不要让 `shared/` 反向依赖 `pages/` 或 `features/`
- 不要在页面文件里堆大段请求实现
- 不要散落无边界的 `utils.ts`
