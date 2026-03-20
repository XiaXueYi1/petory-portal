---
name: master-thread-command
description: Generate a launch-ready main-thread command for the user's three-thread git worktree workflow. Use when the user gives a feature name plus a brief outline, rough scope, or a few bullets and wants them expanded into a complete master-thread release command, task sheet, or kickoff prompt for server, web, and miniprogram threads. Also use when the user wants a reusable command template for parallel development in this repository.
---

# Master Thread Command

Generate a complete main-thread kickoff command from a small amount of user input.

This skill is for the workflow defined in the repository root `AGENTS.md`:

- one stable branch: `master`
- three parallel threads: `server`, `web`, `miniprogram`
- three temporary worktree slots:
  - `project-server-task`
  - `project-web-task`
  - `project-mini-task`
- feature docs stored under:
  - `docs/features/server/<feature>/`
  - `docs/features/web/<feature>/`
  - `docs/features/min-program/<feature>/`

For broader repository rules, implementation constraints, and reference guides, use this skill together with `petory-parallel-dev` when available.

## Hard rules

- Do not read or reference `node_modules`
- Keep the output launch-ready
- Expand vague user outlines into clear execution scope
- Keep the command specific to this repository layout
- Default to `docs/features/min-program/` for mini program docs
- Keep branch names in this format:
  - `feat/server-<feature>`
  - `feat/web-<feature>`
  - `feat/mini-<feature>`

## Required output shape

Unless the user asks for another format, output one ready-to-send master-thread command in plain text with these sections:

1. `【Feature 发布】`
2. `feature`
3. `目标`
4. `联调基线`
5. `分支`
6. `工作目录`
7. `文档目录`
8. `阅读限制`
9. `本轮范围`
10. `交付标准`
11. `线程启动指令`

## How to expand user input

When the user only provides a rough outline, infer the missing structure conservatively:

- Turn the user's topic into a single `feature` slug
- Turn short bullets into per-thread scope
- If the user does not split work by thread, split it yourself:
  - `server`: API, data, validation, auth, service logic, contract
  - `web`: page, interaction, state flow, request access, desktop/browser UX
  - `miniprogram`: page, login state, cache, mobile/wechat adaptation, request access
- If backend work is unclear, default to "define minimal contract first"
- If frontend work is unclear, default to "complete minimal page and contract integration"
- If the user gives almost no detail, produce a minimal closed-loop first-version plan rather than a large speculative scope

## Writing rules

- Write in Chinese unless the user asks otherwise
- Keep sections compact but concrete
- Use imperative task language
- Make each thread able to start immediately after receiving the command
- Include explicit doc paths
- Include the reading restriction:
  - do not read `node_modules`
  - exclude `node_modules` from search

## Default repository assumptions

Use these assumptions unless the user overrides them:

- server code lives in `petory-server/`
- web code lives in `petory-web/`
- mini program code lives in `mini-program/`
- docs live in `docs/`
- feature docs are already created or will be created before kickoff

## Default command skeleton

If needed, follow the reference at `references/master-command-template.md`.

## When the user gives very little information

If the user only says something like:

- "做 auth"
- "做 profile，支持 web 和小程序"
- "宠物档案功能，后端先出接口"

then still generate a full kickoff command. Fill the missing parts with:

- a short one-sentence goal
- a minimal integration baseline
- a conservative per-thread scope
- explicit documentation requirements
- clear thread startup prompts

## Do not do these things

- Do not return only abstract advice when the user wants a command
- Do not ask the user to manually reformat the outline first
- Do not generate monorepo paths like `apps/web` or `apps/server`
- Do not use `docs/features/miniprogram/`; use `docs/features/min-program/`
