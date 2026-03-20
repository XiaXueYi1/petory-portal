import type { FormProps } from 'antd'
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProfile, login } from '@/features/auth/api'
import type { AuthProfile, LoginPayload } from '@/features/auth/api'
import { useAuthStore } from '@/app/store/auth.store'
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
        ? '登录失败，请稍后重试。'
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
              使用最小登录闭环先把 Web 与 auth 基线连通。界面保持简洁，
              重点验证账号、错误提示、登录成功跳转和 profile 初始化流程。
            </Typography.Paragraph>
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBlock label="默认账号" value="admin" />
              <InfoBlock label="默认密码" value="123456" />
              <InfoBlock label="接口前缀" value="/v1" />
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
                登录后台
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: 0, color: 'var(--app-muted)' }}
              >
                当前只接管理员登录，后续再补完整权限导航与业务首页。
              </Typography.Paragraph>
            </div>

            {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}

            <Form<LoginPayload>
              layout="vertical"
              initialValues={DEFAULT_ACCOUNT}
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input size="large" placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password size="large" placeholder="请输入密码" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loginMutation.isPending}
              >
                登录
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
