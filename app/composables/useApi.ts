export const useApi = () => {
  const config = useRuntimeConfig()
  const { user } = useAuth()

  const apiFetch = <T = any>(url: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> => {
    const headers: Record<string, string> = {}
    if (user.value?.apiKey) {
      headers['X-API-Key'] = user.value.apiKey
    }
    return $fetch<T>(`${config.public.apiBase}${url}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> || {}) }
    })
  }

  return { apiFetch }
}
