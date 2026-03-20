# Web Theme Design

## 1. 文档目标

本文档用于定义 `petory-web/` 的主题系统设计基线，目标如下：

- 保持 Web 端主题源头唯一
- 支持当前主题稿中的品牌色、语义色、圆角、阴影和排版约束
- 让 Ant Design、Tailwind CSS 和自定义样式消费同一套语义 token
- 为后续 `light / dark / warm` 等多主题扩展预留空间

本文档只约束 Web 端主题模块设计，不代表仓库已经把全部主题能力落地。

---

## 2. 当前结论

Web 端主题系统正式采用以下方向：

1. 主题系统属于应用级模块，建议落在 `petory-web/src/app/theme/`
2. 主题源头以代码生成的语义 token 为唯一真源
3. Ant Design 直接消费运行时主题 token
4. Tailwind CSS 通过 CSS variables 间接消费运行时主题 token
5. 页面层不直接散落品牌原色，而是优先消费语义变量
6. 当前先按 `light` 单主题优先落地，同时预留 `dark` 和多主题扩展能力

---

## 3. 与当前前端架构的关系

这份文档是 [frontend-architecture.md](/e:/projects/petory-portal/docs/project/frontend-architecture.md) 的专题补充，约束如下：

- 主题系统属于应用级能力，应落在 `petory-web/src/app/` 范围内
- 不再推荐旧式 `src/theme/` 顶层目录
- Ant Design Provider、主题状态、CSS variables 同步逻辑都应与 `AppProviders` 和应用启动流程保持一致

推荐结构：

```txt
petory-web/src/app/
├── providers/
├── router/
├── styles/
└── theme/
    ├── index.ts
    ├── tokens.ts
    ├── semantic.ts
    ├── antd-theme.ts
    ├── apply-theme.ts
    └── theme-store.ts
```

---

## 4. 核心设计原则

### 4.1 单一主题源头

正式要求：

- 先定义基础 palette
- 再映射为 semantic tokens
- 再分别适配给 Ant Design 和 CSS variables

不允许同时维护多套互相独立的颜色表。

### 4.2 语义优先

页面消费应优先使用语义 token，例如：

- `colorBgPage`
- `colorBgCard`
- `colorTextPrimary`
- `colorTextSecondary`
- `colorBorder`
- `colorBrand`
- `colorSuccess`
- `colorWarning`
- `colorDanger`

而不是在页面里直接大量散落原始品牌色值。

### 4.3 Tailwind 只消费 CSS Variables

Tailwind 负责布局与工具类表达，不直接持有当前主题对象。

运行时主题切换时：

- React 应用代码生成当前主题 token
- `applyTheme()` 同步 CSS variables
- Tailwind 类名保持稳定
- 页面通过变量值变化完成视觉切换

### 4.4 主题切换由应用代码显式控制

主题模式应由应用层状态控制，例如：

- 用户设置
- 后台配置
- 本地主题 store

不把系统暗色模式作为唯一控制源。

---

## 5. 主题模块职责

### 5.1 `tokens.ts`

定义基础 palette，例如：

- brand
- neutral
- success
- warning
- danger
- info

### 5.2 `semantic.ts`

负责把 palette 映射成页面直接可消费的 semantic tokens。

### 5.3 `antd-theme.ts`

负责把 semantic tokens 转成 Ant Design `ThemeConfig`。

### 5.4 `apply-theme.ts`

负责把 semantic tokens 写入 `document.documentElement` 上的 CSS variables。

### 5.5 `theme-store.ts`

负责持有当前主题模式，例如：

- `light`
- `dark`
- 后续可扩展 `warm-light`

---

## 6. 推荐变量命名

统一使用：

```txt
--pt-color-*
--pt-radius-*
--pt-shadow-*
```

推荐变量：

- `--pt-color-bg-page`
- `--pt-color-bg-card`
- `--pt-color-bg-soft`
- `--pt-color-text-primary`
- `--pt-color-text-secondary`
- `--pt-color-border`
- `--pt-color-brand`
- `--pt-color-brand-hover`
- `--pt-color-success`
- `--pt-color-warning`
- `--pt-color-danger`
- `--pt-radius-sm`
- `--pt-radius-md`
- `--pt-radius-lg`
- `--pt-shadow-card`
- `--pt-shadow-popup`

---

## 7. 与 Tailwind 和 Ant Design 的协作

### 7.1 Ant Design

由 `ConfigProvider` 直接消费运行时生成的 `ThemeConfig`。

### 7.2 Tailwind CSS

通过 CSS variables 间接消费主题值，例如：

- `bg-[var(--pt-color-bg-card)]`
- `text-[var(--pt-color-text-primary)]`
- `border-[var(--pt-color-border)]`

### 7.3 页面层约束

- 不允许页面组件自己再维护一套品牌色映射
- 不允许主题值散落在 feature / page 层硬编码
- Web 主题 token 只允许从 `app/theme/` 向外输出

---

## 8. 最小落地顺序

建议按以下顺序落地：

1. 建立 `app/theme/` 模块
2. 定义 `ThemeName`、palette 和 semantic tokens
3. 在 `AppProviders` 中接入 Ant Design 主题
4. 在应用启动时执行 `applyTheme()`
5. 再补主题 store 和切换 UI

---

## 9. 当前边界

当前这份文档属于设计约束，不代表仓库里这些能力已全部实现。

当前可确认的事实是：

- Web 已有基础主题方向文档
- Web 已接入 Tailwind CSS 4
- Web 已有应用壳层，可承接后续主题接入

尚未完成：

- 完整 `app/theme/` 实现
- Ant Design 主题 token 实装
- 多主题切换 UI

