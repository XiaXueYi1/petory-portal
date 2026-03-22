import type { FormProps } from 'antd'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProfile, login } from '@/features/auth/api'
import type { AuthProfile, LoginPayload } from '@/features/auth/api'
import { useAuthStore } from '@/app/store/auth.store'
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
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(23,71,255,0.22),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(255,176,59,0.22),_transparent_26%),linear-gradient(180deg,_#f7f9ff_0%,_#eef4ff_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[linear-gradient(135deg,_rgba(23,71,255,0.06),_transparent_55%)]" />

      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_440px]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[rgba(255,255,255,0.54)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-[rgba(23,71,255,0.12)] blur-2xl" />
          <Space direction="vertical" size={22} className="relative w-full">
            <span className="inline-flex w-fit items-center rounded-full border border-[var(--app-border)] bg-white/80 px-4 py-1 text-sm font-medium text-[var(--app-muted)]">
              {APP_NAME}
            </span>
            <div className="max-w-2xl">
              <Typography.Title
                level={1}
                style={{
                  margin: 0,
                  color: 'var(--app-ink)',
                  fontSize: 'clamp(2.8rem, 5vw, 5rem)',
                  lineHeight: 0.98,
                }}
              >
                Welcome back.
              </Typography.Title>
              <Typography.Paragraph
                style={{
                  marginTop: 16,
                  marginBottom: 0,
                  color: 'var(--app-muted)',
                  fontSize: '1.04rem',
                  maxWidth: 640,
                }}
              >
                Sign in to continue managing pets, records, and system access.
                Your password is encrypted before it leaves the browser, then
                verified by the server against the stored hash.
              </Typography.Paragraph>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <FeaturePill title="Fast Access" value="phone + password" />
              <FeaturePill title="Session" value="cookie first" />
              <FeaturePill title="Profile" value="auto bootstrap" />
            </div>
          </Space>
        </section>

        <Card
          bordered={false}
          className="overflow-hidden !rounded-[32px] !border-0 !bg-[rgba(255,255,255,0.88)] !shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl"
        >
          <Space direction="vertical" size={20} className="w-full">
            <div className="space-y-2">
              <Typography.Title level={3} style={{ margin: 0 }}>
                Sign in
              </Typography.Title>
              <Typography.Paragraph style={{ margin: 0, color: 'var(--app-muted)' }}>
                Use your phone number and password to continue.
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
              requiredMark={false}
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
                Sign in to Petory
              </Button>
            </Form>
          </Space>
        </Card>
      </div>
    </main>
  )
}

function FeaturePill({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[var(--app-border)] bg-white/72 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <Typography.Text
        style={{ display: 'block', color: 'var(--app-muted)', marginBottom: 6 }}
      >
        {title}
      </Typography.Text>
      <Typography.Text strong style={{ fontSize: '1rem' }}>
        {value}
      </Typography.Text>
    </div>
  )
}
