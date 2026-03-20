# 主线程发令模板参考

```text
【Feature 发布】
feature: <feature>
目标: <一句话目标>

联调基线:
- server 先出最小可用契约
- web / miniprogram 按契约并行实现
- 联调问题回到各自分支修复

分支:
- server: feat/server-<feature>
- web: feat/web-<feature>
- miniprogram: feat/mini-<feature>

工作目录:
- server: project-server-task
- web: project-web-task
- miniprogram: project-mini-task

文档目录:
- server: docs/features/server/<feature>/
- web: docs/features/web/<feature>/
- miniprogram: docs/features/min-program/<feature>/

阅读限制:
- 不要阅读 node_modules
- 检索时排除 node_modules
- 优先阅读源码、配置、README、docs

本轮范围:
- server:
  - <接口 / 数据 / 校验 / 鉴权 / 服务逻辑>
- web:
  - <页面 / 交互 / 状态 / 请求接入>
- miniprogram:
  - <页面 / 登录态 / 缓存 / 端适配 / 请求接入>

交付标准:
- 代码可运行
- 基础校验通过
- 文档补齐
- changelog 写明真实变更、联调问题、已知限制

线程启动指令:

[server]
你现在负责 server 线程。
工作目录：project-server-task
分支：feat/server-<feature>
功能：<feature>
先阅读项目，但不要阅读 node_modules。
先梳理现有后端骨架，再定义契约并实现最小闭环。
完成后同步更新 docs/features/server/<feature>/。

[web]
你现在负责 web 线程。
工作目录：project-web-task
分支：feat/web-<feature>
功能：<feature>
先阅读项目，但不要阅读 node_modules。
基于 server 契约完成 Web 页面、交互和接口接入。
完成后同步更新 docs/features/web/<feature>/。

[miniprogram]
你现在负责 miniprogram 线程。
工作目录：project-mini-task
分支：feat/mini-<feature>
功能：<feature>
先阅读项目，但不要阅读 node_modules。
基于 server 契约完成小程序页面、登录态处理和接口接入。
完成后同步更新 docs/features/min-program/<feature>/。
```
