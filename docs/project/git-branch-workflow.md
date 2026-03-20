# Git 分支与 Worktree 工作流

## 1. 文档目标

本文档记录当前仓库采用的 Git 协作方式，并与根目录 `AGENTS.md` 保持一致。

---

## 2. 工作流结论

本项目不采用长期存在的 `thread-a-web`、`thread-b-server` 这类固定开发分支。

当前正式采用以下规则：

- 稳定主线只有一个：`master`
- 功能开发使用短生命周期 feature 分支
- 每轮功能通过 `git worktree` 建立三个临时工作目录
- 功能完成后合入 `master`
- 分支与临时 worktree 都要清理

---

## 3. 分支命名规范

### 3.1 功能分支

```txt
feat/server-<feature>
feat/web-<feature>
feat/mini-<feature>
```

例如：

```txt
feat/server-auth
feat/web-auth
feat/mini-auth
```

### 3.2 修复分支

如确实需要单独修复联调问题，可使用：

```txt
fix/server-<feature>
fix/web-<feature>
fix/mini-<feature>
```

---

## 4. Worktree 目录规范

建议固定复用三个任务槽位：

```txt
project-master
project-server-task
project-web-task
project-mini-task
```

含义：

- `project-master`：主线常驻目录
- `project-server-task`：当前后端任务目录
- `project-web-task`：当前 Web 任务目录
- `project-mini-task`：当前小程序任务目录

---

## 5. 标准开发流程

### 5.1 开始新功能

以 `auth` 为例：

```bash
cd project-master
git checkout master
git pull origin master

git worktree add ../project-server-task -b feat/server-auth master
git worktree add ../project-web-task -b feat/web-auth master
git worktree add ../project-mini-task -b feat/mini-auth master
```

### 5.2 主线程发布机制

主线程的目标不是亲自写三端代码，而是把本轮 feature 启动到“线程拿到命令即可直接开工”的状态。

主线程最小职责：

1. 更新 `master`
2. 创建三个 worktree
3. 确定本轮 `feature` 名
4. 确定三端范围
5. 发布统一任务单

### 5.3 主线程统一任务单模板

推荐主线程每轮直接发布以下模板：

```text
【Feature 发布】
feature: <feature>
目标: <一句话目标>

分支:
- server: feat/server-<feature>
- web: feat/web-<feature>
- miniprogram: feat/mini-<feature>

目录:
- server: project-server-task
- web: project-web-task
- miniprogram: project-mini-task

范围:
- server: <接口 / 数据 / 鉴权 / 服务逻辑范围>
- web: <页面 / 交互 / 状态 / 联调范围>
- miniprogram: <页面 / 登录态 / 缓存 / 联调范围>

文档:
- server: docs/features/server/<feature>/
- web: docs/features/web/<feature>/
- miniprogram: docs/features/min-program/<feature>/

交付标准:
- 代码可运行
- 基础校验通过
- 文档补齐
- changelog 写明真实变更和已知限制
```

### 5.4 三线程启动模板

主线程发布后，三个线程应直接接单执行。

`server`：

```text
工作目录：project-server-task
分支：feat/server-<feature>
目标：先定义契约，再实现服务端逻辑，并更新 docs/features/server/<feature>/
```

`web`：

```text
工作目录：project-web-task
分支：feat/web-<feature>
目标：实现 Web 页面与交互，对接 server 契约，并更新 docs/features/web/<feature>/
```

`miniprogram`：

```text
工作目录：project-mini-task
分支：feat/mini-<feature>
目标：实现小程序页面与交互，对接 server 契约，并更新 docs/features/min-program/<feature>/
```

### 5.5 主线程发车完成定义

主线程满足以下条件后，就视为“本轮已发车”，三个线程可以开始开发：

1. `master` 已更新
2. 三个 worktree 已创建成功
3. 三个 feature 分支已就位
4. 对应 feature 文档目录已准备好
5. 统一任务单已发布

### 5.2 三线程职责

- `server`：接口、模型、鉴权、服务端文档
- `web`：Web 页面、状态、请求接入、联调文档
- `miniprogram`：小程序页面、端适配、登录态、联调文档

### 5.3 文档要求

每端开发时都要同步补齐各自的功能文档：

- `docs/features/server/<feature>/`
- `docs/features/web/<feature>/`
- `docs/features/min-program/<feature>/`

---

## 6. 合并规则

推荐合并顺序：

1. `server`
2. `web`
3. `miniprogram`

在 `project-master` 中依次执行：

```bash
git checkout master
git pull origin master
git merge --no-ff feat/server-auth
git push origin master

git merge --no-ff feat/web-auth
git push origin master

git merge --no-ff feat/mini-auth
git push origin master
```

---

## 7. 清理规则

功能完成并确认已合入 `master` 后，清理 worktree 和分支：

```bash
git worktree remove ../project-server-task
git worktree remove ../project-web-task
git worktree remove ../project-mini-task

git branch -d feat/server-auth
git branch -d feat/web-auth
git branch -d feat/mini-auth
```

---

## 8. 当前结论

1. `master` 是唯一长期可信主线。
2. 功能分支必须短生命周期，用完即删。
3. `git worktree` 只服务当前活跃任务，不作为长期目录资产。
4. 项目文档必须跟着各自 feature 分支一起演进并合入主线。

---

## 9. 项目阅读限制

在主线程或任一子线程阅读项目时，统一遵守以下规则：

- 不阅读 `node_modules`
- 不把 `node_modules` 纳入检索范围
- 优先阅读源码、配置、脚本、README 和 `docs/`

推荐执行方式：

- 使用带排除规则的文件检索
- 只围绕 `petory-server/`、`petory-web/`、`mini-program/`、`docs/` 建立上下文
- 需要确认依赖版本时只查看 `package.json` 和锁文件
