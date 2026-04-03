<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-6">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-3">⚽</div>
        <h1 class="text-3xl font-bold text-white">FootPress <span class="text-green-400">AI</span></h1>
        <p class="text-gray-500 mt-2 text-sm">Plateforme IA pour journalistes sportifs</p>
      </div>

      <!-- Form -->
      <div class="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <h2 class="text-sm font-semibold text-gray-300 mb-5">Connexion</h2>

        <div class="space-y-4">
          <!-- Username -->
          <div>
            <label class="text-xs text-gray-400 mb-1.5 block">Nom d'utilisateur</label>
            <input
              v-model="username"
              type="text"
              placeholder="ex: karim.benzali"
              @keyup.enter="focusPassword"
              ref="usernameRef"
              class="w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors"
              :class="error ? 'border-red-600 focus:border-red-500' : 'border-gray-700 focus:border-green-500'"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="text-xs text-gray-400 mb-1.5 block">Mot de passe</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="••••••••"
                @keyup.enter="submit"
                ref="passwordRef"
                class="w-full bg-gray-800 border rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors pr-10"
                :class="error ? 'border-red-600 focus:border-red-500' : 'border-gray-700 focus:border-green-500'"
              />
              <button
                type="button"
                @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs"
              >
                {{ showPwd ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
            <span>⚠️</span> {{ error }}
          </div>

          <!-- Submit -->
          <button
            @click="submit"
            :disabled="loading || !username || !password"
            class="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span>{{ loading ? 'Connexion...' : 'Se connecter →' }}</span>
          </button>
        </div>
      </div>

      <!-- Hint comptes disponibles -->
      <div class="mt-4 bg-gray-900/50 rounded-xl p-4 border border-gray-800/50">
        <p class="text-xs text-gray-500 mb-2 font-medium">Comptes disponibles :</p>
        <div class="space-y-1.5">
          <button
            v-for="u in ACCOUNTS"
            :key="u.username"
            @click="fillCredentials(u)"
            class="w-full flex items-center gap-2 text-left hover:bg-gray-800 rounded-lg px-2 py-1.5 transition-colors group"
          >
            <span class="text-base">{{ u.avatar }}</span>
            <div class="flex-1 min-w-0">
              <span class="text-xs text-gray-300 group-hover:text-white transition-colors">{{ u.label }}</span>
            </div>
            <span class="text-xs font-mono text-gray-600 group-hover:text-green-500 transition-colors shrink-0">
              {{ u.username }}
            </span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { login } = useAuth()

const username = ref('')
const password = ref('')
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')
const passwordRef = ref(null)

// Comptes simulés avec username + password
const ACCOUNTS = [
  { username: 'karim.benzali',  password: 'footpress2025', label: 'Karim Benzali — Rédacteur Sport',    avatar: '⚽', id: 'journaliste1', name: 'Karim Benzali',  role: 'Rédacteur Sport',    apiKey: 'key-j1-footpress'   },
  { username: 'sofia.marchand', password: 'footpress2025', label: 'Sofia Marchand — Correspondante UEFA', avatar: '🎙️', id: 'journaliste2', name: 'Sofia Marchand', role: 'Correspondante UEFA', apiKey: 'key-j2-footpress'   },
  { username: 'demo',           password: 'demo',          label: 'Compte Démo — Accès visiteur',        avatar: '👁️', id: 'demo',         name: 'Compte Démo',    role: 'Accès visiteur',     apiKey: 'demo-key-footpress' },
]

const fillCredentials = (u) => {
  username.value = u.username
  password.value = u.password
  error.value = ''
  passwordRef.value?.focus()
}

const focusPassword = () => passwordRef.value?.focus()

const submit = async () => {
  error.value = ''
  if (!username.value || !password.value) return

  loading.value = true
  await new Promise(r => setTimeout(r, 800)) // simulation délai réseau

  const account = ACCOUNTS.find(a => a.username === username.value && a.password === password.value)

  if (!account) {
    loading.value = false
    error.value = 'Identifiants incorrects. Vérifiez votre nom d\'utilisateur et mot de passe.'
    return
  }

  login({
    id: account.id,
    name: account.name,
    role: account.role,
    apiKey: account.apiKey,
    avatar: account.avatar,
    color: 'green'
  })

  await navigateTo('/')
}
</script>
