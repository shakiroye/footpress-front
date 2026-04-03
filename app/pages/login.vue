<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-6">
    <div class="w-full max-w-lg">

      <!-- Logo -->
      <div class="text-center mb-10">
        <div class="text-5xl mb-3">⚽</div>
        <h1 class="text-3xl font-bold text-white">FootPress <span class="text-green-400">AI</span></h1>
        <p class="text-gray-400 mt-2 text-sm">Plateforme IA pour journalistes sportifs</p>
      </div>

      <!-- User cards -->
      <div class="space-y-3 mb-8">
        <p class="text-xs text-gray-500 text-center uppercase tracking-widest mb-4">Choisissez votre compte</p>

        <button
          v-for="u in users"
          :key="u.id"
          @click="selectUser(u)"
          class="w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group"
          :class="[
            selected?.id === u.id
              ? 'border-green-500 bg-green-500/10 scale-[1.01]'
              : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800'
          ]"
        >
          <div class="text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 group-hover:scale-110 transition-transform shrink-0">
            {{ u.avatar }}
          </div>
          <div class="flex-1">
            <p class="font-semibold text-white text-sm">{{ u.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ u.role }}</p>
            <p class="text-xs font-mono mt-1" :class="u.id === 'demo' ? 'text-gray-500' : 'text-green-600'">
              {{ u.apiKey }}
            </p>
          </div>
          <div class="shrink-0">
            <div v-if="loading === u.id" class="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <div v-else-if="selected?.id === u.id" class="text-green-400 text-lg">✓</div>
            <div v-else class="text-gray-600 text-sm group-hover:text-gray-400 transition-colors">→</div>
          </div>
        </button>
      </div>

      <!-- Info -->
      <div class="bg-gray-900 rounded-xl p-4 border border-gray-800 text-xs text-gray-500 text-center">
        <p>Chaque journaliste dispose d'un espace RAG isolé.</p>
        <p class="mt-1">La clé API est envoyée automatiquement avec chaque requête.</p>
      </div>

    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: false })

const { login } = useAuth()
const selected = ref(null)
const loading = ref(null)

const users = [
  { id: 'journaliste1', name: 'Karim Benzali',  role: 'Rédacteur Sport',       apiKey: 'key-j1-footpress',   avatar: '⚽' },
  { id: 'journaliste2', name: 'Sofia Marchand', role: 'Correspondante UEFA',    apiKey: 'key-j2-footpress',   avatar: '🎙️' },
  { id: 'demo',         name: 'Compte Démo',    role: 'Accès visiteur',         apiKey: 'demo-key-footpress', avatar: '👁️' }
]

const selectUser = async (u) => {
  selected.value = u
  loading.value = u.id
  await new Promise(r => setTimeout(r, 700))
  login(u)
  await navigateTo('/')
}
</script>
