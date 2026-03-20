import { RouterProvider } from 'react-router-dom'
import '@/app/styles/global.css'
import { AppProviders } from '@/app/providers/AppProviders'
import { router } from '@/app/router/router'

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
