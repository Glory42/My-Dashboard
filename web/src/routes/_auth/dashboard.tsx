import { createFileRoute } from '@tanstack/react-router'
import DashboardPage from '@/features/board/DashboardPage'

export const Route = createFileRoute('/_auth/dashboard')({
  component: function Dashboard() {
    const { user } = Route.useRouteContext()
    return <DashboardPage user={user} />
  },
})
