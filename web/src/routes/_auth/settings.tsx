import { createFileRoute } from '@tanstack/react-router'
import SettingsPage from '@/features/settings/SettingsPage'

export const Route = createFileRoute('/_auth/settings')({
  component: function Settings() {
    const { user } = Route.useRouteContext()
    return <SettingsPage user={user} />
  },
})
