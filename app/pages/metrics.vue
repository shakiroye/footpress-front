<template>
  <div class="max-w-4xl mx-auto p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-1">📊 Métriques Live</h1>
        <p class="text-gray-400 text-sm">Monitoring en temps réel de l'API FootPress AI</p>
      </div>
      <button @click="loadMetrics" class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
        ↻ Rafraîchir
      </button>
    </div>

    <div v-if="metrics" class="space-y-6">
      <!-- KPIs -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
          <p class="text-3xl font-bold text-green-400">{{ metrics.total_requests }}</p>
          <p class="text-xs text-gray-400 mt-1">Requêtes totales</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
          <p class="text-3xl font-bold" :class="metrics.error_rate_pct > 5 ? 'text-red-400' : 'text-green-400'">
            {{ metrics.error_rate_pct }}%
          </p>
          <p class="text-xs text-gray-400 mt-1">Taux d'erreur</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
          <p class="text-3xl font-bold text-blue-400">{{ metrics.avg_duration_ms }}ms</p>
          <p class="text-xs text-gray-400 mt-1">Durée moyenne</p>
        </div>
        <div class="bg-gray-900 rounded-xl p-5 border border-gray-800 text-center">
          <p class="text-3xl font-bold text-purple-400">{{ metrics.active_users }}</p>
          <p class="text-xs text-gray-400 mt-1">Utilisateurs actifs</p>
        </div>
      </div>

      <!-- Endpoints -->
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 class="text-sm font-semibold mb-4 text-gray-300">Requêtes par endpoint</h3>
        <div class="space-y-3">
          <div v-for="(count, path) in metrics.requests_by_endpoint" :key="path" class="flex items-center gap-3">
            <span class="text-xs font-mono text-gray-400 w-64 truncate">{{ path }}</span>
            <div class="flex-1 bg-gray-800 rounded-full h-2">
              <div class="h-2 rounded-full bg-green-500 transition-all"
                :style="`width: ${Math.round(count / metrics.total_requests * 100)}%`" />
            </div>
            <span class="text-xs text-gray-400 w-8 text-right">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Users -->
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 class="text-sm font-semibold mb-4 text-gray-300">Requêtes par utilisateur</h3>
        <div class="space-y-2">
          <div v-for="(count, user) in metrics.requests_by_user" :key="user"
            class="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2 text-sm">
            <span class="text-gray-300">👤 {{ user }}</span>
            <span class="text-green-400 font-mono">{{ count }} req</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 py-20">
      <p>Chargement des métriques...</p>
    </div>
  </div>
</template>

<script setup>
const { apiFetch } = useApi()
const metrics = ref(null)

const loadMetrics = async () => {
  try {
    metrics.value = await apiFetch('/metrics')
  } catch {}
}

onMounted(() => {
  loadMetrics()
  setInterval(loadMetrics, 10000) // refresh toutes les 10s
})
</script>
