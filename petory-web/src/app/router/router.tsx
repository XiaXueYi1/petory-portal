import { createBrowserRouter } from 'react-router-dom'
import { RedirectIfAuthenticated, RequireAuth } from '@/app/router/guards'
import { RootLayout } from '@/layouts/RootLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LoginPage } from '@/pages/login/LoginPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
])
