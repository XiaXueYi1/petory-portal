import type { FormProps } from 'antd'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProfile, login } from '@/features/auth/api'
import type { AuthProfile, LoginPayload } from '@/features/auth/api'
import { useAuthStore } from '@/app/store/auth.store'
import { env } from '@/shared/config/env'
import { APP_NAME } from '@/shared/constants/app'
import { encryptLoginPassword } from '@/shared/lib/crypto'
import { ApiError } from '@/shared/lib/request'

const DEFAULT_ACCOUNT: LoginPayload = {
  phone: '',
  password: '',
}

const PHONE_RULE = /^1[3-9]\d{9}$/

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const setProfile = useAuthStore((state) => state.setProfile)

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const password = await encryptLoginPassword(payload.password)
      await login({
        phone: payload.phone,
        password,
      })
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
      phone: values.phone.trim(),
      password: values.password,
    })
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(23,71,255,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,_#f7f9ff_0%,_#eef4ff_100%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_420px]">
        <section className="rounded-[36px] border border-white/70 bg-white/55 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
          <Space direction="vertical" size={18} className="w-full">
            <span className="inline-flex w-fit items-center rounded-full border border-[var(--app-border)] bg-white/80 px-4 py-1 text-sm font-medium text-[var(--app-muted)]">
              {APP_NAME}
            </span>
            <Typography.Title
              level={1}
              style={{
                margin: 0,
                color: 'var(--app-ink)',
                fontSize: 'clamp(2.6rem, 5vw, 4.8rem)',
                lineHeight: 1.02,
              }}
            >
              Welcome back.
            </Typography.Title>
            <Typography.Paragraph
              style={{
                margin: 0,
                color: 'var(--app-muted)',
                fontSize: '1.02rem',
                maxWidth: 620,
              }}
            >
              Sign in with phone and password. The password field is encrypted
              before it leaves the browser, then decrypted on the server and
              checked against the stored hash.
            </Typography.Paragraph>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBlock label="Login Mode" value="phone + password" />
              <InfoBlock label="Session" value="cookie" />
              <InfoBlock label="API Base" value={env.apiBaseUrl} />
            </div>
          </Space>
        </section>

        <Card
          bordered={false}
          className="overflow-hidden !rounded-[32px] !border-0 !bg-[rgba(255,255,255,0.84)] !shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl"
        >
          <Space direction="vertical" size={18} className="w-full">
            <div>
              <Typography.Title level={3} style={{ marginBottom: 8 }}>
                Sign in
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: 0, color: 'var(--app-muted)' }}
              >
                Enter your phone number and password. After login the app will
                bootstrap your profile and go to the home page.
              </Typography.Paragraph>
            </div>

            {errorMessage ? (
              <Alert type="error" showIcon message={errorMessage} />
            ) : null}

            <Form<LoginPayload>
              layout="vertical"
              initialValues={DEFAULT_ACCOUNT}
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: 'Please enter your phone number.' },
                  {
                    pattern: PHONE_RULE,
                    message: 'Please enter a valid mainland China phone number.',
                  },
                ]}
              >
                <Input
                  size="large"
                  type="tel"
                  maxLength={11}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="13800138000"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password.' },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter your password"
                />
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
    <div className="rounded-[24px] border border-[var(--app-border)] bg-white/72 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <Typography.Text style={{ display: 'block', color: 'var(--app-muted)' }}>
        {label}
      </Typography.Text>
      <Typography.Text strong style={{ fontSize: '1rem' }}>
        {value}
      </Typography.Text>
    </div>
  )
}
