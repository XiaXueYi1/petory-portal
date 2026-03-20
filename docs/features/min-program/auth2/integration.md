# Mini Program Auth2 Integration

## 1. Integration Policy

Mini program integration in this round follows these rules:

- use Bearer Token for API authorization
- do not add token to login requests
- keep request shape class-based and compact
- do not force code sharing with the web request implementation

---

## 2. Request Contract

The mini request client is intended to be used like this:

```ts
miniHttp.get<UserProfile>('/auth/profile')
miniHttp.post<LoginResult, LoginForm>('/auth/wechat-mini/login', form, { auth: false })
```

Design rules:

- `post<TResponse, TBody = any>()` keeps the payload type open
- `auth: false` disables token injection
- `Authorization` header is built as `Bearer <token>`
- token is stored in mini local storage under the configured key

---

## 3. Auth Flow

### 3.1 Current design state

The first-stage mini auth flow is designed around WeChat phone-number login, but the platform capability is not connected yet.

So the current state is:

- design fixed
- backend contract expected
- code integration pending

### 3.2 Intended sequence

```txt
wx.login()
 -> code
 -> backend exchange using appid + secret
 -> obtain openid + session_key
 -> bind or verify phone number
 -> create or match internal user
 -> return Bearer JWT
```

### 3.3 Request behavior by endpoint type

- login endpoints: no auth header
- profile / business endpoints: attach Bearer token
- token refresh is not part of this round

---

## 4. Environment Usage

The mini request and auth behavior rely on the following config entries from `.env.dev`:

- `TARO_APP_ID`
- `MINI_API_BASE_URL`
- `MINI_AUTH_TOKEN_KEY`
- `MINI_AUTH_HEADER_NAME`
- `MINI_AUTH_HEADER_PREFIX`
- `MINI_REQUEST_TIMEOUT`
- `MINI_LOGIN_STRATEGY`
- `MINI_WECHAT_PHONE_LOGIN_STATUS`

`mini-program/.env.prod` remains a placeholder and should be filled later.

---

## 5. Validation

This round does not run build or dev startup.

What was checked:

- file layout and scope
- env file structure
- request client surface
- feature doc consistency

---

## 6. Notes for Later Rounds

- connect the phone-number login platform capability
- wire real backend auth endpoints
- verify token storage and expiry handling
- consider whether login success should hydrate a mini auth store
