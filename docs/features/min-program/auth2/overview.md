# Mini Program Auth2 Overview

## 1. Goal

This feature slice defines the mini-program auth baseline for `auth2`.

The scope in this round is intentionally small:

- environment files
- request layer design
- Bearer Token strategy
- design notes for the first-stage WeChat phone-number login

No business page work is included in this round.

---

## 2. Current Scope

### 2.1 What is included

- `mini-program/.env.dev`
- `mini-program/.env.prod`
- class-shaped request client design
- Bearer Token injection for authorized requests
- auth strategy notes for mini-program

### 2.2 What is not included

- actual platform login capability integration
- business pages
- build execution
- dev server startup
- refresh-token workflow
- backend implementation changes

---

## 3. Auth Strategy

Mini program auth uses Bearer Token.

The intended request behavior is:

- login requests do not attach a token
- normal API requests attach `Authorization: Bearer <token>`
- token is stored in mini-program local storage
- request client can clear or replace token on demand

### 3.1 First-stage login direction

The first-stage mini login flow is designed as:

`wx.login()` -> `code` -> backend exchange -> phone binding -> user lookup or creation -> JWT issuance

Important:

- the strategy is defined
- the platform capability is not wired in yet
- code in this round only records the design direction

---

## 4. Request Design

The request layer is designed as a class to keep the same mental model as the web side, but without forcing code reuse.

Core goals:

- compact API surface
- generic typing on response payloads
- explicit auth opt-out for login endpoints
- Bearer token by default
- keep the dependency surface minimal

Example style:

```ts
miniHttp.post<LoginResult, LoginForm>('/auth/login', form, { auth: false })
```

The actual implementation is class-based and currently built on top of `axios`.

---

## 5. Env Files

### 5.1 Dev

`mini-program/.env.dev` currently contains:

- `TARO_APP_ID`
- `MINI_API_BASE_URL`
- `MINI_AUTH_TOKEN_KEY`
- `MINI_AUTH_HEADER_NAME`
- `MINI_AUTH_HEADER_PREFIX`
- `MINI_REQUEST_TIMEOUT`
- `MINI_LOGIN_STRATEGY`
- `MINI_WECHAT_PHONE_LOGIN_STATUS`

### 5.2 Prod

`mini-program/.env.prod` is kept as a placeholder for now.

It is intentionally not treated as production-ready in this round.

---

## 6. Implementation Notes

- Build-time env loading is handled in mini-program config.
- Runtime access is centralized in `src/shared/config/env.ts`.
- Request code is isolated under `src/shared/request/`.
- The request client is reusable, but it is not shared with web implementation.

---

## 7. Risks

- The phone-number login capability still needs platform-side integration.
- Backend and mini-program token exchange behavior still needs end-to-end verification later.
- The request client is designed but not exercised by a live page in this round.

