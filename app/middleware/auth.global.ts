export default defineNuxtRouteMiddleware((to) => {
  // Page login toujours accessible
  if (to.path === '/login') return

  const user = useState<any>('auth_user')

  // Côté client : tenter de restaurer depuis localStorage
  if (import.meta.client) {
    if (!user.value) {
      const stored = localStorage.getItem('footpress_user')
      if (stored) {
        try {
          user.value = JSON.parse(stored)
          return // restauré avec succès
        } catch {
          localStorage.removeItem('footpress_user')
        }
      }
      // Aucune session → redirection login
      return navigateTo('/login')
    }
  }
})
