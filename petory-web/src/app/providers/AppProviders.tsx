import type { ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/config/queryClient'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          borderRadius: 16,
          colorPrimary: '#1747ff',
          fontFamily:
            '"Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConfigProvider>
  )
}
