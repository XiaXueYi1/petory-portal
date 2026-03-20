---
name: petory-parallel-dev
description: Repository-specific development workflow and implementation constraints for Petory Portal. Use when working in this repository on feature development, three-thread git worktree coordination, task splitting, file placement, backend or frontend architecture decisions, Prisma/database design, coding conventions, performance choices, or when generating kickoff and handoff instructions that must follow the project's server/web/miniprogram workflow.
---

# Petory Parallel Dev

Use this skill as the default project guide when working in this repository.

This skill consolidates the legacy `.agents/skills/*.md` guides and the repository root workflow constraints into one standard skill format.

## Core repository rules

- Treat this repository as a large single repository, not a monorepo
- Main applications live in:
  - `petory-server/`
  - `petory-web/`
  - `mini-program/`
- Feature docs live in:
  - `docs/features/server/<feature>/`
  - `docs/features/web/<feature>/`
  - `docs/features/min-program/<feature>/`
- Follow the three-thread worktree workflow:
  - `server`
  - `web`
  - `miniprogram`
- Use short-lived feature branches:
  - `feat/server-<feature>`
  - `feat/web-<feature>`
  - `feat/mini-<feature>`

## Hard rules

- Do not read `node_modules`
- Do not include `node_modules` in searches
- Prefer reading source code, config files, `docs/`, and README files
- Do not generate monorepo paths like `apps/web`, `apps/server`, or `packages/*`
- Use `docs/features/min-program/`, not `docs/features/miniprogram/`
- Treat design documents as planning unless code has actually landed

## Use this skill for these decisions

- How to split one feature across `server`, `web`, and `miniprogram`
- How to prepare a main-thread kickoff command
- Where new files should live in the Web codebase
- How to structure NestJS modules and DTO/VO layers
- How to design Prisma models and migrations
- How to keep coding style and abstraction boundaries consistent
- How to think about React performance in this project

## Quick workflow

1. Read `references/workflow.md` for repo-level coordination rules
2. If the task is kickoff or dispatch related, also read `references/task-dispatch.md`
3. If the task is Web structure related, read `references/project-structure.md`
4. If the task is backend related, read `references/backend-nestjs.md`
5. If the task is database related, read `references/prisma-database.md`
6. If the task is coding-style related, read `references/coding-guidelines.md`
7. If the task is React performance related, read `references/react-performance.md`

## Task dispatch behavior

When the user gives a rough feature outline, expand it into:

- a feature name
- a one-sentence goal
- a minimal integration baseline
- per-thread scope
- documentation requirements
- launch-ready thread startup instructions

If the user wants only a launch command, prefer using the `master-thread-command` skill alongside this one.

## Reference map

- Workflow and branch strategy: `references/workflow.md`
- Main-thread dispatch and task splitting: `references/task-dispatch.md`
- Web project structure: `references/project-structure.md`
- NestJS development rules: `references/backend-nestjs.md`
- Prisma and database rules: `references/prisma-database.md`
- Coding style rules: `references/coding-guidelines.md`
- React performance rules: `references/react-performance.md`
