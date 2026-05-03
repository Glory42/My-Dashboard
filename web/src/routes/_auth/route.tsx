import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { api } from '@/api/client'
import type { User } from '@/api/types'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData({
        queryKey: ['me'],
        queryFn: () => api.get<User>('/auth/me'),
        staleTime: Infinity,
      })
      return { user }
    } catch {
      throw redirect({ to: '/login' })
    }
  },
  component: () => <Outlet />,
})
