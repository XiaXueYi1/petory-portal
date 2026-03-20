# 三线程工作流

## 主线规则

- 唯一稳定主线是 `master`
- 所有功能都从最新 `master` 切出
- 不直接在 `master` 做业务开发

## 三线程

- `server`
- `web`
- `miniprogram`

## 分支命名

```text
feat/server-<feature>
feat/web-<feature>
feat/mini-<feature>
```

修复分支只在确实需要时使用：

```text
fix/server-<feature>
fix/web-<feature>
fix/mini-<feature>
```

## Worktree 槽位

```text
project-master
project-server-task
project-web-task
project-mini-task
```

## 文档目录

```text
docs/features/server/<feature>/
docs/features/web/<feature>/
docs/features/min-program/<feature>/
```

## 阅读限制

- 不要阅读 `node_modules`
- 检索时排除 `node_modules`
- 优先读源码、配置、README、`docs/`

## 发车完成定义

主线程满足以下条件后，三个线程即可开始开发：

1. `master` 已更新
2. 三个 feature 分支对应 worktree 已创建
3. 对应 feature 文档目录已存在
4. 统一任务单已发布

## 合并顺序

推荐：

1. `server`
2. `web`
3. `miniprogram`

## 完成定义

一个 feature 至少满足：

- 三端各自范围完成
- 文档已补齐
- 联调问题已记录
- 已合入 `master`
- feature 分支已删除
- worktree 已清理
