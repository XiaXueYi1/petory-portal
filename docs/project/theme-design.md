# Web Theme Design

## 1. 文档目标

本文档用于定义 Petory Web 端的主题系统设计方案，目标如下：

- 支持宠物项目偏暖感的品牌主题基线
- 支持明亮模式与暗色模式切换
- 通过代码动态生成当前主题 tokens
- 让 Ant Design 直接消费当前主题 tokens
- 让 Tailwind CSS 4 通过 CSS variables / CSS tokens 间接消费当前主题 tokens
- 保持主题源头唯一，避免 Antd 与 Tailwind 各维护一套颜色真相

本文档只定义主题模块方案，不展开品牌视觉稿与页面级 UI 规范。

---

## 2. 当前结论

Web 主题系统正式采用以下方案：

1. 主题系统作为独立应用级模块维护
2. 通过代码动态生成当前主题 tokens
3. Ant Design 直接消费运行时 tokens
4. Tailwind CSS 4 不直接消费运行时 JS tokens，而是通过 CSS variables / CSS tokens 间接消费
5. Tailwind 样式入口与主题 CSS tokens 聚合到同一个主题模块中
6. 主题切换通过应用代码显式控制，不依赖系统自动切换
7. 当前先支持 `light / dark`，但设计必须为后续多主题扩展预留空间

---

## 3. 与当前前端架构的关系

这份文档是 `docs/project/frontend-architecture.md` 的专题补充，约束如下：

- 主题系统属于应用级能力，应落在 `petory-web/src/app/` 范围内
- 不建议再单独使用旧式 `src/theme/` 顶层目录
- Ant Design Provider、主题状态、CSS variables 同步逻辑都应与 `AppProviders` 和应用启动流程保持一致

推荐落点：

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

说明：

- `styles/` 负责全局样式入口
- `theme/` 负责主题源数据、语义 tokens、Antd 映射与运行时同步
- 若后续主题状态并入全局 store，也可以把 `theme-store.ts` 合并进 `app/store/`

---

## 4. 核心设计原则

### 4.1 单一主题源头

主题必须只有一个源头，不允许：

- Antd 一套 token
- Tailwind 一套独立颜色表
- 页面局部再写一套自定义色值

正式要求：

- 先生成统一的语义 tokens
- 再分别适配给 Antd 与 CSS tokens

### 4.2 语义优先，不直接到处消费原始色板

项目运行时主要消费语义 token，例如：

- `colorBgPage`
- `colorBgCard`
- `colorTextPrimary`
- `colorTextSecondary`
- `colorBorder`
- `colorBrand`
- `colorSuccess`
- `colorWarning`
- `colorDanger`

而不是在页面里到处直接写：

- `orange-500`
- `neutral-900`

### 4.3 Tailwind 4 负责消费 CSS tokens，不直接消费运行时对象

Tailwind 4 是样式层，不负责持有当前主题对象。
Tailwind 类名保持稳定，真实颜色值通过 CSS variables 在运行时切换。

### 4.4 主题切换由应用代码显式控制

主题模式由应用层控制，例如：

- Zustand store
- app config
- 用户设置
- 后台系统配置

不以浏览器系统主题为唯一依据。

---

## 5. 主题模块职责

### 5.1 `tokens.ts`

存放主题基础色板与主题源数据。

例如：

- light palette
- dark palette
- brand palette
- neutral palette
- success / warning / danger / info palette

这里是“原始色板层”。

### 5.2 `semantic.ts`

负责把原始色板转换成“当前可消费的语义 tokens”。

例如输出：

- `colorBgPage`
- `colorBgCard`
- `colorTextPrimary`
- `colorTextSecondary`
- `colorBorder`
- `colorBrand`
- `colorBrandHover`
- `colorSuccess`
- `colorWarning`
- `colorDanger`

这里是“语义层”。

### 5.3 `antd-theme.ts`

负责把语义 tokens 转成 Ant Design `ThemeConfig`，包括：

- `token`
- `components`
- 各组件局部 token

### 5.4 `apply-theme.ts`

负责把语义 tokens 同步到 DOM 根节点 CSS variables。

例如：

- `--pt-color-bg-page`
- `--pt-color-text-primary`
- `--pt-color-border`
- `--pt-color-brand`

### 5.5 `theme-store.ts`

负责持有当前主题标识，例如：

- `light`
- `dark`
- 后续扩展的 `warm-light`

如果主题状态最终放进 `app/store/`，这个文件可改为统一 store 切片。

### 5.6 `styles/`

全局样式入口负责：

- 导入 Tailwind
- 定义基础 CSS variables 占位
- 承载基础主题全局样式
- 与 `applyTheme()` 运行时更新配合

---

## 6. 为什么 Tailwind 与 CSS Tokens 要聚合

因为当前目标不是“静态配一套色板”，而是“运行时根据当前主题切换”。

在这种前提下：

- Tailwind 是消费层
- CSS variables 是桥接层
- 主题 token 生成逻辑是源头层

如果 Tailwind 入口样式与 CSS tokens 分散在多个位置，会导致：

1. 主题切换逻辑分散
2. 变量命名不统一
3. Antd 与 Tailwind 不同步
4. 暗色模式和多主题维护成本上升

因此推荐：

- 主题相关的 CSS variables 由 `app/theme/` 统一生成
- 全局样式入口保持在 `app/styles/`
- 两者通过明确的导出与应用启动流程连接

---

## 7. 运行时主题切换方案

### 7.1 运行时流程

```txt
当前主题 mode 改变
  -> 生成当前 semantic tokens
  -> 生成当前 antd theme config
  -> applyTheme() 同步 CSS variables
  -> ConfigProvider 使用当前 antd theme
  -> Tailwind 类名通过 CSS variables 自动生效
```

### 7.2 切换逻辑结论

- 主题切换不依赖重新编译 Tailwind
- 主题切换不依赖动态生成 Tailwind 类名
- Tailwind 保持稳定类名
- 通过变量值变化实现视觉切换

---

## 8. 推荐接口与文件结构

### 8.1 `tokens.ts`

负责定义主题原始色板。

```ts
export type ThemeName = 'light' | 'dark'

export const lightPalette = { ... }
export const darkPalette = { ... }
```

这里只定义颜色原始来源，不直接给页面消费。

### 8.2 `semantic.ts`

负责把 palette 映射成语义 token。

```ts
export type SemanticTokens = {
  colorBgPage: string
  colorBgCard: string
  colorTextPrimary: string
  colorTextSecondary: string
  colorBorder: string
  colorBrand: string
  colorSuccess: string
  colorWarning: string
  colorDanger: string
}
```

并提供：

```ts
createSemanticTokens(themeName: ThemeName): SemanticTokens
```

### 8.3 `antd-theme.ts`

负责提供：

```ts
createAntdTheme(tokens: SemanticTokens): ThemeConfig
```

### 8.4 `apply-theme.ts`

负责提供：

```ts
applyTheme(tokens: SemanticTokens, themeName: ThemeName): void
```

职责：

- 把 `SemanticTokens` 写入 `document.documentElement`
- 同步 CSS 变量
- 设置 `data-theme="light"` / `data-theme="dark"`

### 8.5 `styles/global.css`

全局样式入口示意：

```css
@import "tailwindcss";

:root {
  --pt-color-bg-page: #f7f4ef;
  --pt-color-bg-card: #ffffff;
  --pt-color-text-primary: #221f1b;
  --pt-color-border: #ede7dd;
  --pt-color-brand: #f97316;
}

html,
body,
#root {
  background: var(--pt-color-bg-page);
  color: var(--pt-color-text-primary);
}
```

说明：

- 这里不是把主题写死，而是提供变量出口
- 真实变量值由 `applyTheme()` 在运行时同步更新

---

## 9. 推荐的主题变量命名规范

统一使用：

```txt
--pt-color-*
--pt-radius-*
--pt-shadow-*
```

推荐变量：

颜色：

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
- `--pt-color-info`

圆角：

- `--pt-radius-sm`
- `--pt-radius-md`
- `--pt-radius-lg`

阴影：

- `--pt-shadow-card`
- `--pt-shadow-popup`

---

## 10. Tailwind 4 在该方案中的角色

Tailwind 4 在本方案中的职责是：

- 提供结构型、布局型 utility
- 消费已经同步好的 CSS variables
- 不直接成为主题切换源头

结论：

- Tailwind 负责“怎么用”
- 主题模块负责“当前值是多少”

---

## 11. 页面如何使用

### 11.1 Antd 组件

通过 `ConfigProvider` 使用当前 `ThemeConfig`：

```txt
ConfigProvider
  theme = createAntdTheme(currentTokens)
```

### 11.2 自定义布局与元素

页面可直接消费语义变量，例如：

- `bg-[var(--pt-color-bg-card)]`
- `text-[var(--pt-color-text-primary)]`
- `border-[var(--pt-color-border)]`

如果后续再封装一层 utility，也应继续基于语义变量，而不是退回原始色板。

---

## 12. Light / Dark 之外的扩展能力

当前虽然先考虑 `light / dark`，但设计必须允许未来扩展：

- `warm-light`
- `warm-dark`
- `festival`
- `veterinary-admin`
- `large-screen`

因此推荐将主题标识设计为：

```ts
type ThemeName = 'light' | 'dark'
```

后续可扩展为：

```ts
type ThemeName = 'light' | 'dark' | 'warm-light' | 'warm-dark'
```

而不是把逻辑写死成布尔值。

---

## 13. 最小实现边界

当前主题文档属于设计约束，不代表仓库里这些能力已经落地。

后续实际接入时，建议最小落地顺序为：

1. 建立 `app/theme/` 模块
2. 增加 `ThemeName`、palette 与 semantic tokens
3. 在 `AppProviders` 中接入 `ConfigProvider theme`
4. 在应用启动时执行 `applyTheme()`
5. 再补 `theme-store` 或统一 `app/store` 切片

---

## 14. 正式结论

Petory Web 的主题系统正式采用以下方案：

1. 主题系统作为应用级独立模块维护
2. 使用代码动态生成当前主题 tokens
3. Ant Design 直接消费运行时 tokens
4. Tailwind CSS 4 通过 CSS tokens / CSS variables 间接消费运行时 tokens
5. 主题 CSS variables 与全局样式入口协同，但职责分离为 `app/theme/` 与 `app/styles/`
6. 主题切换由应用代码显式控制
7. 当前先支持 `light / dark`，并为后续多主题扩展预留空间
