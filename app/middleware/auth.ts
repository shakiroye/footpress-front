export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/login') return

  const user = useState<any>('auth_user')

  if (!user.value && import.meta.client) {
    const stored = localStorage.getItem('footpress_user')
    if (stored) {
      try { user.value = JSON.parse(stored); return } catch {}
    }
    return navigateTo('/login')
  }
})
