import { ApiOutlined, BuildOutlined, CodeOutlined } from '@ant-design/icons'
import { Card, Divider, Space, Tag, Typography } from 'antd'
import { APP_NAME, FOUNDATION_STACK } from '@/shared/constants/app'

const foundationCards = [
  {
    title: '基础能力',
    icon: <BuildOutlined />,
    items: ['pnpm', '@ 别名', '目录骨架', '模板清理'],
  },
  {
    title: '技术栈基线',
    icon: <CodeOutlined />,
    items: FOUNDATION_STACK,
  },
  {
    title: '当前边界',
    icon: <ApiOutlined />,
    items: ['不做业务页面', '不接入完整业务路由', '不做状态流落地'],
  },
] as const

export function RootLayout() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="overflow-hidden rounded-[32px] border border-white/50 bg-[var(--app-panel)] p-6 shadow-[var(--app-shadow)] backdrop-blur-xl sm:p-8 lg:p-10">
          <Space direction="vertical" size={14} className="w-full">
            <Space size={10} wrap>
              <Tag color="blue">web foundation</Tag>
              <Tag color="gold">pnpm</Tag>
              <Tag color="cyan">alias ready</Tag>
            </Space>
            <Typography.Title
              level={1}
              style={{
                margin: 0,
                color: 'var(--app-ink)',
                fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
              }}
            >
              {APP_NAME}
            </Typography.Title>
            <Typography.Paragraph
              style={{
                margin: 0,
                color: 'var(--app-muted)',
                fontSize: '1.05rem',
                maxWidth: 760,
              }}
            >
              这是 Web 线程的基础搭建结果：依赖、别名、最小入口和目录骨架已经收口，
              业务页面与完整路由流会留到下一轮再继续。
            </Typography.Paragraph>
          </Space>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {foundationCards.map((card) => (
            <Card
              key={card.title}
              bordered={false}
              className="overflow-hidden !rounded-[28px] !border-white/40 !bg-white/70 !shadow-[var(--app-shadow)] backdrop-blur-xl"
            >
              <Space direction="vertical" size={16} className="w-full">
                <Space size={10} align="center">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1747ff] text-white">
                    {card.icon}
                  </span>
                  <Typography.Title level={3} style={{ margin: 0 }}>
                    {card.title}
                  </Typography.Title>
                </Space>
                <Divider style={{ margin: 0 }} />
                <Space direction="vertical" size={8}>
                  {card.items.map((item) => (
                    <Tag
                      key={item}
                      color="default"
                      style={{ width: 'fit-content', padding: '4px 10px' }}
                    >
                      {item}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Card>
          ))}
        </section>
      </section>
    </main>
  )
}
