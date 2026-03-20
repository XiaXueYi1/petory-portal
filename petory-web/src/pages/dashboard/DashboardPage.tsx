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
        className="overflow-hidden !rounded-[32px] !bg-white/78 !shadow-[var(--app-shadow)] backdrop-blur-xl"
      >
        <Space direction="vertical" size={18} className="w-full">
          <Space size={12} wrap>
            <Tag color="blue">authenticated</Tag>
            {profile?.roles.map((role) => (
              <Tag key={role} color="gold">
                {role}
              </Tag>
            ))}
          </Space>

          <div>
            <Typography.Title level={2} style={{ marginBottom: 8 }}>
              登录成功
            </Typography.Title>
            <Typography.Paragraph
              style={{ margin: 0, color: 'var(--app-muted)' }}
            >
              This is still a temporary home screen. It verifies the auth2 cookie
              flow, profile bootstrap, and basic sign-out path before the real
              dashboard, menu tree, and dynamic routes land in later work.
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
            <Button loading={logoutMutation.isPending} onClick={() => logoutMutation.mutate()}>
              退出登录
            </Button>
          </div>
        </Space>
      </Card>
    </section>
  )
}
