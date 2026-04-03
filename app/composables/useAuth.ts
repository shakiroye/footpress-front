export interface FootPressUser {
  id: string
  name: string
  role: string
  apiKey: string
  avatar: string
  color: string
}

export const USERS: FootPressUser[] = [
  {
    id: 'journaliste1',
    name: 'Karim Benzali',
    role: 'Rédacteur Sport',
    apiKey: 'key-j1-footpress',
    avatar: '⚽',
    color: 'green'
  },
  {
    id: 'journaliste2',
    name: 'Sofia Marchand',
    role: 'Correspondante UEFA',
    apiKey: 'key-j2-footpress',
    avatar: '🎙️',
    color: 'blue'
  },
  {
    id: 'demo',
    name: 'Compte Démo',
    role: 'Accès visiteur',
    apiKey: 'demo-key-footpress',
    avatar: '👁️',
    color: 'gray'
  }
]

export const useAuth = () => {
  const user = useState<FootPressUser | null>('auth_user', () => {
    if (import.meta.client) {
      const stored = localStorage.getItem('footpress_user')
      if (stored) {
        try { return JSON.parse(stored) } catch {}
      }
    }
    return null
  })

  const login = (u: FootPressUser) => {
    user.value = u
    if (import.meta.client) {
      localStorage.setItem('footpress_user', JSON.stringify(u))
    }
  }

  const logout = () => {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('footpress_user')
    }
    navigateTo('/login')
  }

  return { user, login, logout }
}
