import { Button, Card, Descriptions, Space, Tag, Typography } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/features/auth/api'
import { useAuthStore } from '@/app/store/auth.store'

export function DashboardPage() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)
  const clearProfile = useAuthStore((state) => state.clearProfile)

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearProfile()
      void queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    },
  })

  return (
    <section className="grid gap-6">
      <Card
        bordered={false}
        className="overflow-hidden !rounded-[32px] !border-0 !bg-[linear-gradient(135deg,_rgba(23,71,255,0.18),_rgba(255,255,255,0.9))] !shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Space direction="vertical" size={12} className="w-full">
            <Tag color="blue" className="w-fit">
              authenticated
            </Tag>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Welcome back, {profile?.user.nickname ?? 'Petory user'}
            </Typography.Title>
            <Typography.Paragraph
              style={{ margin: 0, color: 'var(--app-muted)' }}
            >
              The workspace is live. Your session is connected, the profile is
              hydrated, and this page now acts as the real landing surface
              after login.
            </Typography.Paragraph>

            <Space size={10} wrap>
              <Tag color="gold">phone login</Tag>
              <Tag color="cyan">session ready</Tag>
              <Tag color="green">profile hydrated</Tag>
            </Space>
          </Space>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard label="用户 ID" value={profile?.user.id ?? '-'} />
            <MetricCard label="角色数" value={`${profile?.roles.length ?? 0}`} />
            <MetricCard
              label="权限数"
              value={`${profile?.permissions.length ?? 0}`}
            />
            <MetricCard
              label="当前状态"
              value={profile ? 'online' : 'unknown'}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card
          bordered={false}
          className="overflow-hidden !rounded-[32px] !border-0 !bg-white/82 !shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl"
        >
          <Space direction="vertical" size={18} className="w-full">
            <div>
              <Typography.Title level={3} style={{ marginBottom: 8 }}>
                Session summary
              </Typography.Title>
              <Typography.Paragraph
                style={{ margin: 0, color: 'var(--app-muted)' }}
              >
                The cookie session is alive and the current profile has been
                loaded. From here, the future pet, record, and admin modules can
                be layered in without changing the login experience.
              </Typography.Paragraph>
            </div>

            <Descriptions
              column={1}
              labelStyle={{ color: 'var(--app-muted)', width: 92 }}
              contentStyle={{ color: 'var(--app-ink)' }}
            >
              <Descriptions.Item label="昵称">
                {profile?.user.nickname ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {profile?.user.email ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                {profile?.user.phone ?? '-'}
              </Descriptions.Item>
            </Descriptions>

            <div className="flex justify-end">
              <Button
                loading={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                退出登录
              </Button>
            </div>
          </Space>
        </Card>

        <Card
          bordered={false}
          className="overflow-hidden !rounded-[32px] !border-0 !bg-[linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(255,255,255,0.8))] !shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl"
        >
          <Space direction="vertical" size={16} className="w-full">
            <Typography.Title level={3} style={{ margin: 0 }}>
              Next steps
            </Typography.Title>

            <div className="grid gap-3">
              <SmallNote
                title="Pet profiles"
                text="Prepare the pet workspace and records."
              />
              <SmallNote
                title="Health logs"
                text="Keep weight, food, and vaccine flows ready."
              />
              <SmallNote
                title="System access"
                text="Role-based navigation and permission gates."
              />
            </div>
          </Space>
        </Card>
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--app-border)] bg-white/78 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <Typography.Text
        style={{ display: 'block', color: 'var(--app-muted)', marginBottom: 6 }}
      >
        {label}
      </Typography.Text>
      <Typography.Text strong style={{ fontSize: '1.1rem' }}>
        {value}
      </Typography.Text>
    </div>
  )
}

function SmallNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[22px] border border-[var(--app-border)] bg-white/78 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
        {title}
      </Typography.Text>
      <Typography.Paragraph style={{ margin: 0, color: 'var(--app-muted)' }}>
        {text}
      </Typography.Paragraph>
    </div>
  )
}
