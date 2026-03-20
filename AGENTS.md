# 三线程 + git worktree 开发流程 Skill

## 1. 目标

用于单人通过 **Codex / AI 三线程并行开发** 管理一个项目，约束：

- 一个稳定主线：`master`
- 三个并行线程：
  - `server`
  - `web`
  - `miniprogram`
- 每轮功能开发都从 `master` 切出短期分支
- 开发完成后合入 `master`
- 分支删除
- `git worktree` 只管理当前活跃任务
- 文档仅规范 `docs/features` 目录

---

## 2. 核心原则

### 2.1 主线唯一可信
`master` 永远表示：

- 当前最新可用状态
- 当前最新文档基线
- 新功能切分支的唯一来源

禁止在长期脏状态下把 `master` 当开发分支使用。

---

### 2.2 分支短生命周期
不保留长期 `server/web/miniprogram` 开发分支。  
每轮功能都重新从 `master` 切出新的短期分支。

例如本轮开发 `auth`：

- `feat/server-auth`
- `feat/web-auth`
- `feat/mini-auth`

完成后：

- 合入 `master`
- 删除分支
- 清理对应 worktree

---

### 2.3 worktree 只服务当前任务
`git worktree` 不是长期资产，只是当前活跃功能的工作目录管理工具。

保留：

- 一个常驻 `master` 目录
- 三个临时任务目录槽位

任务完成后，移除临时 worktree。

---

### 2.4 文档跟功能走
每个功能开发时，在 `docs/features` 下维护该功能对应端的文档。  
功能完成后，随代码一起合入 `master`。

这样可保证：

- 新功能分支从 `master` 切出时文档天然是最新
- 文档按端隔离，冲突少
- 历史可回溯

---

## 3. 仓库角色划分

### 3.1 分支角色

#### `master`
用途：

- 稳定主线
- 最新功能基线
- 最新文档基线

约束：

- 不直接做日常功能开发
- 所有功能都通过 feature 分支合入

---

### 3.2 短期功能分支
格式：

- `feat/server-<feature>`
- `feat/web-<feature>`
- `feat/mini-<feature>`

用途：

- 当前功能开发
- 当前功能文档补充
- 当前功能联调修复

特点：

- 从 `master` 切出
- 生命周期短
- 合并后删除

---

## 4. 命名规范

### 4.1 分支命名规范

#### 功能分支
```text
feat/server-<feature>
feat/web-<feature>
feat/mini-<feature>
```

示例：

```text
feat/server-auth
feat/web-auth
feat/mini-auth
```

---

#### 修复分支
当某一端需要单独修复联调问题时：

```text
fix/server-<feature>
fix/web-<feature>
fix/mini-<feature>
```

示例：

```text
fix/server-auth
fix/web-auth
```

通常能直接在当前功能分支修就不要额外切 `fix`。

---

#### 基础建设分支
用于项目初始化或端能力基建：

```text
feat/server-foundation
feat/web-foundation
feat/mini-foundation
```

示例：

- Nest 基础架构
- Vite 基础配置
- 小程序基础目录和请求层

---

### 4.2 worktree 目录命名规范

建议固定目录槽位，不跟着 feature 名变化。

```text
project-master
project-server-task
project-web-task
project-mini-task
```

说明：

- `project-master`：常驻主线目录
- `project-server-task`：当前后端活跃功能目录
- `project-web-task`：当前 Web 活跃功能目录
- `project-mini-task`：当前小程序活跃功能目录

优点：

- Codex 线程绑定稳定
- 本地目录不混乱
- 每轮功能复用同一套槽位

---

## 5. docs/features 目录规范

只约束 `features`。

推荐结构：

```text
docs/
  features/
    server/
      auth/
        overview.md
        api.md
        changelog.md
    web/
      auth/
        overview.md
        integration.md
        changelog.md
    min-program/
      auth/
        overview.md
        integration.md
        changelog.md
```

---

### 5.1 顶层规则

`docs/features` 下只按三端拆：

```text
docs/features/server
docs/features/web
docs/features/min-program
```

禁止混放。

---

### 5.2 功能目录规则

每个功能在对应端下建立同名目录：

```text
docs/features/server/auth
docs/features/web/auth
docs/features/min-program/auth
```

功能名必须与分支 feature 名保持一致。

例如：

- 分支：`feat/server-auth`
- 文档目录：`docs/features/server/auth`

---

### 5.3 文件建议

#### `overview.md`
说明本端该功能做什么：

- 功能目标
- 范围
- 页面/接口/状态说明
- 约束和依赖

---

#### `api.md`
仅 server 侧强制建议有：

- 接口路径
- 请求参数
- 响应结构
- 错误码
- 字段说明

Web / 小程序端不强制有 `api.md`，通常放 `integration.md`。

---

#### `integration.md`
用于前端端：

- 联调方式
- 字段映射
- 请求时序
- 登录态/缓存/异常处理
- 依赖的后端接口说明

---

#### `changelog.md`
记录本端此功能的真实落地变更：

- 本次新增
- 本次修改
- 联调修复
- 已知限制

这个文件非常重要，方便回溯。

---

## 6. 标准开发流程

### 6.1 初始化阶段

本地常驻主线目录：

```bash
git clone <repo> project-master
cd project-master
git checkout master
git pull origin master
```

---

### 6.1.1 主线程常驻职责

主线程只负责：

- 保持 `master` 最新
- 创建本轮三个 feature 分支
- 创建三个 worktree
- 发布统一任务指令
- 汇总线程产出并决定合并顺序

主线程不直接承担三端业务开发实现。

---

### 6.2 开始一轮新功能

以 `auth` 为例。

先保证 `master` 最新：

```bash
cd project-master
git checkout master
git pull origin master
```

从 `master` 创建三个 worktree：

```bash
git worktree add ../project-server-task -b feat/server-auth master
git worktree add ../project-web-task -b feat/web-auth master
git worktree add ../project-mini-task -b feat/mini-auth master
```

此时形成四个目录：

```text
project-master
project-server-task
project-web-task
project-mini-task
```

---

### 6.2.1 主线程发布命令模板

主线程在完成 worktree 创建后，应该发布一份统一任务单。  
目标是让 `server`、`web`、`miniprogram` 三个线程拿到任务后即可直接开始开发。

推荐模板：

```text
【Feature 发布】
feature: <feature>
目标: <一句话说明本轮目标>
联调基线: server 先出契约，web / miniprogram 并行实现，后续回到各自分支修联调问题

分支:
- server: feat/server-<feature>
- web: feat/web-<feature>
- miniprogram: feat/mini-<feature>

工作目录:
- server: project-server-task
- web: project-web-task
- miniprogram: project-mini-task

本轮范围:
- server: <后端范围>
- web: <Web 范围>
- miniprogram: <小程序范围>

文档要求:
- server: docs/features/server/<feature>/
- web: docs/features/web/<feature>/
- miniprogram: docs/features/min-program/<feature>/

交付要求:
- 代码可运行
- 基础校验通过
- 文档补齐
- changelog 记录真实变更和限制
```

---

### 6.2.2 三线程接单即开工模板

主线程发布后，三个线程直接按各自模板执行，不需要再等待额外拆解。

#### server 线程模板

```text
你现在负责 server 线程。

工作目录：project-server-task
分支：feat/server-<feature>
功能：<feature>

你的职责：
1. 先定义或补齐接口契约
2. 实现后端代码，只改服务端相关内容
3. 补齐 docs/features/server/<feature>/overview.md
4. 如有接口，补齐 docs/features/server/<feature>/api.md
5. 在 docs/features/server/<feature>/changelog.md 记录真实改动

完成标准：
- 接口或服务逻辑可运行
- 文档和代码一致
- 明确告知联调依赖、已知限制、待前端确认项
```

#### web 线程模板

```text
你现在负责 web 线程。

工作目录：project-web-task
分支：feat/web-<feature>
功能：<feature>

你的职责：
1. 基于当前 feature 目标完成 Web 页面和交互
2. 对接 server 已确定的接口契约
3. 只改 Web 相关内容
4. 补齐 docs/features/web/<feature>/overview.md
5. 补齐 docs/features/web/<feature>/integration.md
6. 在 docs/features/web/<feature>/changelog.md 记录真实改动

完成标准：
- 页面可运行
- 交互流程闭环
- 联调依赖和字段映射写清楚
- 已知限制写入 changelog
```

#### miniprogram 线程模板

```text
你现在负责 miniprogram 线程。

工作目录：project-mini-task
分支：feat/mini-<feature>
功能：<feature>

你的职责：
1. 基于当前 feature 目标完成小程序页面和交互
2. 对接 server 已确定的接口契约
3. 只改小程序相关内容
4. 补齐 docs/features/min-program/<feature>/overview.md
5. 补齐 docs/features/min-program/<feature>/integration.md
6. 在 docs/features/min-program/<feature>/changelog.md 记录真实改动

完成标准：
- 页面可运行
- 登录态、缓存、异常处理说明清楚
- 联调依赖和字段映射写清楚
- 已知限制写入 changelog
```

---

### 6.2.3 主线程一键发车清单

每轮只要主线程完成下面 5 步，三个线程就可以开始开发：

1. 在 `project-master` 更新 `master`
2. 创建三个 feature 分支对应的 worktree
3. 确认 `docs/features/server|web|min-program/<feature>/` 已存在
4. 发布统一任务单
5. 把三个线程绑定到固定目录槽位

只要这 5 步完成，就不需要主线程继续做额外前置搭建。

---

### 6.3 三线程职责

#### 线程 1：server
工作目录：

```text
project-server-task
```

职责：

- 后端接口
- DTO / 参数校验
- 统一返回
- 异常处理
- 数据模型
- 鉴权逻辑
- 更新 `docs/features/server/<feature>/`

---

#### 线程 2：web
工作目录：

```text
project-web-task
```

职责：

- 页面结构
- 交互逻辑
- 状态流转
- 请求接入
- 联调
- 更新 `docs/features/web/<feature>/`

---

#### 线程 3：miniprogram
工作目录：

```text
project-mini-task
```

职责：

- 小程序页面
- 小程序状态与请求逻辑
- 登录态/缓存/端适配
- 联调
- 更新 `docs/features/min-program/<feature>/`

---

### 6.4 开发顺序建议

推荐顺序：

1. `server` 先定义接口和返回契约
2. `web` 和 `miniprogram` 并行做页面与交互
3. 后端功能可用后，前端开始联调
4. 联调问题回到对应端分支修复
5. 各端文档同步补齐
6. 逐个合入 `master`

---

## 7. 合并规则

### 7.1 合并前要求

每个分支合入前至少满足：

- 代码可运行
- 基础校验通过
- 对应端文档已补充到 `docs/features/...`
- 当前功能描述与代码一致

---

### 7.2 合并顺序建议

推荐顺序：

1. `server`
2. `web`
3. `miniprogram`

原因：

- 后端通常定义最终契约
- 前端端更依赖后端稳定结果
- 小程序通常在接口和交互层面复用更多约束

如果某端未完成，不阻塞其他端先合，但文档必须写明状态。

---

### 7.3 合并步骤

在 `project-master` 中操作。

先合 server：

```bash
cd project-master
git checkout master
git pull origin master
git merge --no-ff feat/server-auth
git push origin master
```

再合 web：

```bash
git merge --no-ff feat/web-auth
git push origin master
```

再合 miniprogram：

```bash
git merge --no-ff feat/mini-auth
git push origin master
```

---

## 8. 清理规则

### 8.1 worktree 清理
功能完成后移除当前任务 worktree：

```bash
git worktree remove ../project-server-task
git worktree remove ../project-web-task
git worktree remove ../project-mini-task
```

查看当前 worktree：

```bash
git worktree list
```

---

### 8.2 分支清理
确认已合入 `master` 后删除分支：

```bash
git branch -d feat/server-auth
git branch -d feat/web-auth
git branch -d feat/mini-auth
```

如远程也有对应分支：

```bash
git push origin --delete feat/server-auth
git push origin --delete feat/web-auth
git push origin --delete feat/mini-auth
```

规则：

- 已合并功能分支必须删除
- 不保留长期 feature 分支
- 回溯靠 Git 历史和 `docs/features`

---

## 9. 下一轮功能如何开始

假设下一轮功能是 `profile`。

重复同样流程：

```bash
cd project-master
git checkout master
git pull origin master

git worktree add ../project-server-task -b feat/server-profile master
git worktree add ../project-web-task -b feat/web-profile master
git worktree add ../project-mini-task -b feat/mini-profile master
```

说明：

- worktree 目录槽位复用
- 分支名每轮更新
- 永远从最新 `master` 切

---

## 10. 冲突控制策略

### 10.1 代码冲突
通过职责隔离减少冲突：

- server 线程尽量只改 `server` 相关
- web 线程尽量只改 `web` 相关
- miniprogram 线程尽量只改 `miniprogram` 相关
- 共享代码改动要谨慎

---

### 10.2 文档冲突
通过 `docs/features` 目录隔离减少冲突：

- server 只改 `docs/features/server/...`
- web 只改 `docs/features/web/...`
- miniprogram 只改 `docs/features/min-program/...`

不要多个线程同时修改同一个 changelog。

---

## 11. 功能完成定义

一个功能视为完成，至少满足：

- 对应端代码完成
- 对应端联调通过
- `docs/features/<端>/<feature>/` 已补齐
- 已合入 `master`
- 分支已删除
- 临时 worktree 已清理

---

## 12. 推荐操作清单

### 12.1 每轮开始前
- 更新 `master`
- 明确本轮 feature 名
- 创建三个短分支
- 创建三个 worktree
- 让三个线程绑定固定目录

---

### 12.2 每轮进行中
- server 先出接口契约
- web / miniprogram 并行开发
- 各端实时补本端 feature 文档
- 联调问题在对应分支修复

---

### 12.3 每轮结束后
- 合并到 `master`
- push 主线
- remove worktree
- delete branch
- 开始下一轮

---

## 13. 一句话规则

**一个主线，三条短分支，三个临时 worktree，文档按 features 三端隔离，功能合完即删分支。**

---

## 14. 阅读项目限制

阅读项目、检索文件、分析目录时，统一遵守以下限制：

- 不要阅读 `node_modules`
- 不要把 `node_modules` 纳入检索范围
- 优先阅读业务源码、配置文件、`docs/`、README 和脚本文件

推荐做法：

- 文件检索时显式排除 `node_modules`
- 目录理解以 `petory-server/`、`petory-web/`、`mini-program/`、`docs/` 为主
- 如果需要判断依赖情况，优先看 `package.json` 和锁文件，不进入 `node_modules` 逐层阅读

这样做的目的：

- 避免无效上下文污染
- 避免浪费分析时间
- 保持对项目真实业务结构的聚焦

---

## 15. 示例

### 分支
```text
feat/server-auth
feat/web-auth
feat/mini-auth
```

### 目录
```text
project-master
project-server-task
project-web-task
project-mini-task
```

### 文档
```text
docs/features/server/auth/overview.md
docs/features/server/auth/api.md
docs/features/server/auth/changelog.md

docs/features/web/auth/overview.md
docs/features/web/auth/integration.md
docs/features/web/auth/changelog.md

docs/features/min-program/auth/overview.md
docs/features/min-program/auth/integration.md
docs/features/min-program/auth/changelog.md
```

---

## 16. 禁止事项

- 禁止长期保留 `server/web/miniprogram` 开发分支
- 禁止直接在 `master` 做业务开发
- 禁止多个线程共用同一个分支
- 禁止在 `docs/features` 下混放三端文档
- 禁止功能完成后不清理 worktree
- 禁止功能合并后继续保留无用分支
- 禁止阅读或检索 `node_modules`
