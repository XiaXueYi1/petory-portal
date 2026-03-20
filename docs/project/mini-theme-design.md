# Mini Program Theme Design

## 1. 文档目标

本文档用于定义 `mini-program/` 的主题与样式系统设计基线，重点覆盖：

- Taro 小程序端主题组织方式
- Taro 多端模式与环境变量对主题的影响
- 设计稿尺寸单位与 Taro `px` 转换规则
- Tailwind CSS 在 Taro 小程序中的适用边界
- Taro UI 自定义主题的接入边界

本文档以当前仓库真实状态为准。当前 `mini-program/` 还没有正式接入完整主题系统，因此本文档主要是主题设计与实现约束。

---

## 2. 当前结论

小程序主题系统正式采用以下方向：

1. 主题系统优先基于 Taro + Sass + CSS variables 组织
2. 当前不把 Tailwind CSS 作为默认前置依赖，只把它定义为可选增强方案
3. 当前不把 Taro UI 当作必选基础依赖，只保留与其主题变量兼容的扩展位
4. 设计稿尺寸基线统一按 Taro 推荐的 `750px` 优先
5. 业务样式书写优先使用 `px`，由 Taro 负责转换到小程序端单位
6. 与平台强相关的主题差异通过 `process.env.TARO_ENV` 和多端文件隔离处理

---

## 3. 与当前项目现状的关系

当前 `mini-program/` 已确认的基线：

- 使用 Taro 4.x
- React 写法
- Sass 模板
- 已有 `.env.dev / .env.prod`
- 已有 `config/env.ts` 和运行时环境读取封装
- 已有 class 形态请求层

当前尚未确认的事实：

- 仓库里还没有正式接入 Tailwind CSS
- 仓库里还没有正式安装 Taro UI
- 仓库里还没有完整落地主题 token、主题 store、深浅色切换

因此，主题方案必须先按“原生 Taro 样式能力可独立成立”来设计，不能把 Tailwind 或 Taro UI 写成既成事实。

---

## 4. Taro 平台模式与环境变量约束

根据 Taro 官方文档，`process.env.TARO_ENV` 用于判断当前编译平台类型，常见值包括：

- `weapp`
- `h5`
- `jd`
- `qq`
- `alipay`
- `tt`

在主题和样式系统中，正式约束如下：

1. 不要解构 `process.env`，应直接使用 `process.env.TARO_ENV`
2. 如果主题资源、样式或组件存在平台差异，应优先通过 `process.env.TARO_ENV` 或多端文件隔离
3. 小程序主题文档默认以 `weapp` 为第一目标平台
4. 与平台强耦合的视觉差异，不应堆在同一个组件里写大量分支

推荐方式：

- 通用主题逻辑：`src/shared/theme/*`
- 端差异较大的实现：`index.weapp.ts`、`index.h5.ts` 这类多端文件

---

## 5. 环境变量与主题配置边界

当前小程序环境变量中，和主题/视觉系统关系较大的主要是：

- `MINI_API_BASE_URL`
- `MINI_LOGIN_STRATEGY`
- `MINI_WECHAT_PHONE_LOGIN_STATUS`

后续如果主题需要加入环境级配置，建议新增但只限轻量字段，例如：

- `MINI_THEME_MODE=light`
- `MINI_ENABLE_EXPERIMENTAL_TW=false`
- `MINI_BRAND_CHANNEL=default`

约束如下：

1. `.env.dev` 可以控制开发期默认主题模式
2. `.env.prod` 仅保留生产默认值，不承载复杂主题逻辑
3. 用户运行时切换后的主题状态，不应只靠环境变量驱动

---

## 6. 设计稿与尺寸单位规则

根据 Taro 官方“设计稿及尺寸单位”文档，正式约束如下：

1. 样式尺寸优先写 `px` 和 `%`
2. Taro 会在编译时自动处理尺寸转换
3. 小程序端默认会把 `px` 转成 `rpx`
4. H5 端默认会把 `px` 转成 `rem`
5. 如果某个 `px` 不希望被转换，可使用 `Px` 或 `PX`

当前项目推荐规则：

- 小程序设计稿统一优先按 `750px` 基线
- 设计稿上量到多少，就先按 `1:1` 写多少 `px`
- 不在业务代码里手写 `rpx` 作为默认风格
- JS 内联样式若涉及尺寸转换，使用 `Taro.pxTransform()`

如果后续设计稿不是 `750px`，则必须同步调整 `config/index.ts` 中的 `designWidth`，并在文档中记录。

---

## 7. 小程序主题组织建议

推荐结构：

```txt
mini-program/src/
├── app.scss
├── shared/
│   ├── theme/
│   │   ├── tokens.ts
│   │   ├── semantic.ts
│   │   ├── css-vars.ts
│   │   └── theme-store.ts
│   ├── config/
│   └── request/
└── pages/
```

职责建议：

- `tokens.ts`：定义品牌色、语义色、圆角、阴影、字号基线
- `semantic.ts`：把基础 palette 映射成业务语义 token
- `css-vars.ts`：把 token 转成 CSS variables 或 Sass 变量出口
- `theme-store.ts`：持有当前主题模式
- `app.scss`：引入全局样式入口和变量占位

---

## 8. Tailwind CSS 在 Taro 小程序中的策略

根据 Taro 官方 “使用 Tailwind CSS” 文档：

- Taro 可以接入 Tailwind CSS
- 小程序场景下通常还需要 `weapp-tailwindcss`
- 需要在安装后执行 `weapp-tw patch`
- Taro 配置侧需要注册对应的 webpack 插件
- 可通过 `rem2rpx` 处理 `rem -> rpx` 转换

结合当前项目，正式结论是：

1. Tailwind CSS 不是小程序当前默认必选项
2. 如果后续决定接入，必须先补专项文档再安装依赖
3. 接入时应限制用途，优先用在布局、间距和少量原子类，不要替代整个主题系统
4. 如果启用 Tailwind，小程序主题值仍应由 CSS variables / token 层统一输出
5. 不允许一边用 Sass 主题变量，一边再在 Tailwind 里单独维护一套品牌色

推荐触发条件：

- 页面密度提升，原子化布局收益明显
- 团队已经接受 `weapp-tailwindcss` 的构建成本
- 样式策略已明确“Tailwind 只是消费层，不是主题源头”

---

## 9. Taro UI 自定义主题策略

Taro UI 当前在项目里尚未安装，因此本节只定义兼容策略。

如果后续接入 Taro UI，主题方向采用：

1. 通过单独的 `custom-variables.scss` 覆盖组件库变量
2. 组件库主题变量必须从项目品牌色和语义色映射而来
3. 不允许直接在页面里覆盖 Taro UI 组件样式作为主方案
4. 主题变量文件应集中维护，不分散到页面级样式里

设计原则：

- 项目主题 token 是源头
- Taro UI SCSS 变量是适配层
- 页面样式是消费层

如果后续不接 Taro UI，这一层可以不落地，但主题设计仍保持兼容。

---

## 10. 推荐主题变量

推荐统一前缀：

```txt
--pt-mini-color-*
--pt-mini-radius-*
--pt-mini-shadow-*
```

推荐最小集合：

- `--pt-mini-color-bg-page`
- `--pt-mini-color-bg-card`
- `--pt-mini-color-text-primary`
- `--pt-mini-color-text-secondary`
- `--pt-mini-color-border`
- `--pt-mini-color-brand`
- `--pt-mini-color-success`
- `--pt-mini-color-warning`
- `--pt-mini-color-danger`
- `--pt-mini-radius-sm`
- `--pt-mini-radius-md`
- `--pt-mini-radius-lg`

---

## 11. 组件与页面层约束

1. 页面层不直接散落品牌原色
2. 业务组件优先消费 semantic tokens
3. 平台差异样式优先通过多端文件或条件编译隔离
4. 不把主题逻辑直接耦合到请求层、登录层或业务 store
5. 如果后续有深色模式，先保证基础页面、卡片、文字、边框四类 token 完整，再扩展组件细节

---

## 12. 最小落地顺序

建议按以下顺序推进：

1. 在 `mini-program/` 补充主题设计文档
2. 明确设计稿基线为 `750px`
3. 建立 `shared/theme/` 目录和最小 token 文件
4. 在 `app.scss` 引入全局变量和页面背景、文字色基线
5. 再决定是否引入 Taro UI
6. 最后再评估是否需要接入 Tailwind CSS

---

## 13. 当前结论

1. 小程序主题系统当前应先以 Taro 原生样式能力、Sass 和 CSS variables 为基线。
2. Taro 官方推荐的尺寸书写方式是按设计稿 `1:1` 写 `px`，由编译期完成转换。
3. 当前项目推荐小程序设计稿以 `750px` 为主标准。
4. `process.env.TARO_ENV` 是小程序跨平台主题差异处理的正式入口，不应解构使用。
5. Tailwind CSS 在 Taro 小程序中可接入，但当前仅作为可选增强方案。
6. Taro UI 自定义主题当前只保留兼容位，不视为已接入能力。
