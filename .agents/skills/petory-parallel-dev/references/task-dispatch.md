# 主线程任务发布规范

## 主线程职责

主线程只负责：

- 更新 `master`
- 创建本轮三个 feature 分支
- 创建三个 worktree
- 发布统一任务单
- 汇总线程结果并安排合并

主线程默认不直接承担三端实现。

## 任务单必须包含

- `feature`
- 目标
- 联调基线
- 三端分支
- 三端工作目录
- 三端文档目录
- 阅读限制
- 三端范围
- 交付标准
- 三段线程启动指令

## 范围拆分默认规则

如果用户没有拆分线程范围，按以下方式补全：

- `server`
  - API 契约
  - 数据结构
  - DTO/校验
  - 鉴权
  - 服务逻辑
- `web`
  - 页面
  - 交互
  - 状态流
  - 请求接入
  - 浏览器端联调
- `miniprogram`
  - 页面
  - 登录态
  - 缓存
  - 端适配
  - 请求接入

## 每个线程的最小交付

### server

- 补齐 `overview.md`
- 有接口时补齐 `api.md`
- 补齐 `changelog.md`
- 写明联调依赖和已知限制

### web

- 补齐 `overview.md`
- 补齐 `integration.md`
- 补齐 `changelog.md`
- 写明字段映射、交互闭环、已知限制

### miniprogram

- 补齐 `overview.md`
- 补齐 `integration.md`
- 补齐 `changelog.md`
- 写明登录态、缓存、异常处理、已知限制

## 冲突控制

以下内容不要并行改动，除非主线程先收敛：

- Prisma schema 主入口
- 路由主入口
- 权限种子数据
- 同一页面主入口
- 同一个 feature 的同一个 changelog 文件
