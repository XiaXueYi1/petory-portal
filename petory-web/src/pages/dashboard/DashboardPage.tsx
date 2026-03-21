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
        className="overflow-hidden !rounded-[32px] !border-0 !bg-[linear-gradient(135deg,_rgba(23,71,255,0.16),_rgba(255,255,255,0.84))] !shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
      >
        <Space direction="vertical" size={12} className="w-full">
          <Tag color="blue" className="w-fit">
            authenticated
          </Tag>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Welcome back, {profile?.user.nickname ?? 'Petory user'}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, color: 'var(--app-muted)' }}>
            This is the first real home shell after login. It confirms the
            cookie session, profile bootstrap, and sign-out flow before the
            actual business modules arrive.
          </Typography.Paragraph>
        </Space>
      </Card>

      <Card
        bordered={false}
        className="overflow-hidden !rounded-[32px] !border-0 !bg-white/82 !shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl"
      >
        <Space direction="vertical" size={18} className="w-full">
          <Space size={12} wrap>
            {profile?.roles.map((role) => (
              <Tag key={role} color="gold">
                {role}
              </Tag>
            ))}
          </Space>

          <div>
            <Typography.Title level={3} style={{ marginBottom: 8 }}>
              Session summary
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0, color: 'var(--app-muted)' }}>
              The app keeps the current cookie session alive, hydrates profile
              data on boot, and leaves room for the future navigation tree and
              business modules.
            </Typography.Paragraph>
          </div>

          <Descriptions
            column={1}
            labelStyle={{ color: 'var(--app-muted)', width: 92 }}
            contentStyle={{ color: 'var(--app-ink)' }}
          >
            <Descriptions.Item label="用户 ID">
              {profile?.user.id ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="昵称">
              {profile?.user.nickname ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">
              {profile?.user.email ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="权限数量">
              {profile?.permissions.length ?? 0}
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
    </section>
  )
}
