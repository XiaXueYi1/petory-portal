import { Layout, Space, Tag, Typography } from 'antd'
import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/shared/constants/app'

export function RootLayout() {
  return (
    <Layout className="min-h-screen !bg-transparent">
      <Layout.Header className="!h-auto !bg-transparent px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[28px] border border-white/55 bg-[var(--app-panel)] px-5 py-4 shadow-[var(--app-shadow)] backdrop-blur-xl">
          <div>
            <Typography.Title
              level={3}
              style={{ margin: 0, color: 'var(--app-ink)' }}
            >
              {APP_NAME}
            </Typography.Title>
            <Typography.Text style={{ color: 'var(--app-muted)' }}>
              Portal workspace
            </Typography.Text>
          </div>

          <Space size={10} wrap>
            <Tag color="blue">/v1 auth</Tag>
            <Tag color="gold">cookie first</Tag>
            <Tag color="cyan">home ready</Tag>
          </Space>
        </div>
      </Layout.Header>

      <Layout.Content className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </Layout.Content>
    </Layout>
  )
}
