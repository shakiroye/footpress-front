<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <nav class="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-6">
      <span class="text-xl font-bold text-green-400">⚽ FootPress AI</span>
      <NuxtLink to="/" class="text-sm hover:text-green-400 transition-colors">Playground</NuxtLink>
      <NuxtLink to="/rag" class="text-sm hover:text-green-400 transition-colors">Archives RAG</NuxtLink>
      <NuxtLink to="/pipeline" class="text-sm hover:text-green-400 transition-colors">Pipeline</NuxtLink>
      <NuxtLink to="/metrics" class="text-sm hover:text-green-400 transition-colors">Métriques</NuxtLink>

      <!-- User badge -->
      <div v-if="user" class="ml-auto flex items-center gap-3">
        <div class="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-1.5 text-sm">
          <span>{{ user.avatar }}</span>
          <span class="text-white font-medium">{{ user.name }}</span>
          <span class="text-gray-500 text-xs">·</span>
          <span class="text-xs text-gray-400">{{ user.role }}</span>
        </div>
        <button
          @click="logout"
          class="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-800"
        >
          Déconnexion
        </button>
      </div>
      <span v-else class="ml-auto text-xs text-gray-500">🟢 API Live</span>
    </nav>

    <NuxtPage />
  </div>
</template>

<script setup>
const { user, logout } = useAuth()
</script>
