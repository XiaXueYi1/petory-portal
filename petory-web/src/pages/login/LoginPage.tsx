import type { FormProps } from 'antd'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProfile, login } from '@/features/auth/api'
import type { AuthProfile, LoginPayload } from '@/features/auth/api'
import { useAuthStore } from '@/app/store/auth.store'
import { env } from '@/shared/config/env'
import { APP_NAME } from '@/shared/constants/app'
import { ApiError } from '@/shared/lib/request'

const DEFAULT_ACCOUNT: LoginPayload = {
  username: 'admin',
  password: '123456',
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setProfile = useAuthStore((state) => state.setProfile)

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      await login(payload)
      return getProfile()
    },
    onSuccess: (profile: AuthProfile) => {
      setProfile(profile)
      void queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })

      const nextPath =
        typeof location.state === 'object' &&
        location.state !== null &&
        'from' in location.state &&
        typeof location.state.from === 'object' &&
        location.state.from !== null &&
        'pathname' in location.state.from &&
        typeof location.state.from.pathname === 'string'
          ? location.state.from.pathname
          : '/'

      navigate(nextPath, { replace: true })
    },
  })

  const errorMessage =
    loginMutation.error instanceof ApiError
      ? loginMutation.error.message
      : loginMutation.isError
        ? 'Login failed. Please try again later.'
        : null

  const handleSubmit: FormProps<LoginPayload>['onFinish'] = (values) => {
    loginMutation.reset()
    loginMutation.mutate({
      username: values.username.trim(),
      password: values.password,
    })
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_420px]">
        <section className="rounded-[36px] border border-white/60 bg-[var(--app-panel)] p-6 shadow-[var(--app-shadow)] backdrop-blur-xl sm:p-8 lg:p-10">
          <Space direction="vertical" size={18} className="w-full">
            <span className="inline-flex w-fit rounded-full border border-[var(--app-border)] bg-white/70 px-4 py-1 text-sm font-medium text-[var(--app-muted)]">
              Web Admin Login
            </span>
            <Typography.Title
              level={1}
              style={{
                margin: 0,
                color: 'var(--app-ink)',
                fontSize: 'clamp(2.4rem, 5vw, 4.6rem)',
              }}
            >
              {APP_NAME}
            </Typography.Title>
            <Typography.Paragraph
              style={{
                margin: 0,
                color: 'var(--app-muted)',
                fontSize: '1.04rem',
                maxWidth: 620,
              }}
            >
              Auth2 now uses dual cookies for access and refresh. This screen
              focuses on the minimal login flow, profile bootstrap, silent refresh,
              and redirect after sign-in.
            </Typography.Paragraph>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBlock label="Default User" value="admin" />
              <InfoBlock label="Cookie Mode" value="access + refresh" />
              <InfoBlock label="API Base" value={env.apiBaseUrl} />
            </div>
          </Space>
        </section>

        <Card
          bordered={false}
          className="overflow-hidden !rounded-[32px] !bg-white/78 !shadow-[var(--app-shadow)] backdrop-blur-xl"
        >
          <Space direction="vertical" size={18} className="w-full">
            <div>
              <Typography.Title level={3} style={{ marginBottom: 8 }}>
                Sign In
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: 0, color: 'var(--app-muted)' }}
              >
                This round keeps the UI minimal. Web does not persist any bearer
                token and relies on server-set cookies plus profile bootstrap.
              </Typography.Paragraph>
            </div>

            <Alert
              type="info"
              showIcon
              message="Local admin account: admin / 123456"
              description="The server writes cookies after login, then the app hydrates auth state through /auth/profile."
            />

            {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}

            <Form<LoginPayload>
              layout="vertical"
              initialValues={DEFAULT_ACCOUNT}
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username.' }]}
              >
                <Input size="large" placeholder="Enter your username" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password.' }]}
              >
                <Input.Password size="large" placeholder="Enter your password" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loginMutation.isPending}
              >
                Sign In
              </Button>
            </Form>
          </Space>
        </Card>
      </div>
    </main>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--app-border)] bg-white/65 px-4 py-4">
      <Typography.Text style={{ display: 'block', color: 'var(--app-muted)' }}>
        {label}
      </Typography.Text>
      <Typography.Text strong style={{ fontSize: '1rem' }}>
        {value}
      </Typography.Text>
    </div>
  )
}
