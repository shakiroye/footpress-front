<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-2">🎯 AI Playground</h1>
    <p class="text-gray-400 mb-6 text-sm">Entrez du texte ou uploadez une image — l'endpoint détecte automatiquement le type.</p>

    <!-- Input -->
    <div class="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-800">
      <textarea
        v-model="text"
        placeholder="Entrez vos notes de match, une question football, ou laissez vide pour envoyer une image..."
        class="w-full bg-gray-800 rounded-lg p-4 text-sm resize-none h-32 outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
      />
      <div class="flex items-center gap-4 mt-4">
        <label class="cursor-pointer bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
          📎 Image
          <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
        </label>
        <span v-if="imageFile" class="text-xs text-green-400">{{ imageFile.name }}</span>
        <button
          @click="analyze"
          :disabled="loading"
          class="ml-auto bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
        >
          {{ loading ? 'Analyse...' : 'Analyser →' }}
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4 text-sm text-red-300">
      {{ error }}
    </div>

    <!-- Result -->
    <div v-if="result" class="space-y-4">
      <!-- Type badge -->
      <div class="flex items-center gap-2">
        <span class="bg-green-900 text-green-300 text-xs px-3 py-1 rounded-full font-mono">{{ result.type }}</span>
      </div>

      <!-- Football query -->
      <div v-if="result.type === 'football_query'" class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 class="text-sm font-semibold text-green-400 mb-3">🤖 Réponse GPT-4o</h3>
        <p class="text-sm text-gray-200 whitespace-pre-wrap">{{ result.response }}</p>
      </div>

      <!-- Text analysis -->
      <template v-if="result.type === 'text'">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 class="text-sm font-semibold text-blue-400 mb-3">📝 Résumé</h3>
            <p class="text-sm text-gray-300">{{ result.summary?.summary }}</p>
          </div>
          <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <h3 class="text-sm font-semibold text-purple-400 mb-3">💬 Sentiment</h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="capitalize font-medium" :class="sentimentColor(result.sentiment?.sentiment)">
                {{ result.sentiment?.sentiment }}
              </span>
            </div>
            <div class="space-y-1">
              <div v-for="(val, key) in result.sentiment?.scores" :key="key" class="flex items-center gap-2 text-xs">
                <span class="w-16 text-gray-400 capitalize">{{ key }}</span>
                <div class="flex-1 bg-gray-800 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full bg-green-500" :style="`width: ${val * 100}%`" />
                </div>
                <span class="text-gray-400">{{ Math.round(val * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 class="text-sm font-semibold text-yellow-400 mb-3">🏷️ Entités détectées</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="e in result.entities?.entities" :key="e.text"
              class="text-xs px-2 py-1 rounded-full border"
              :class="entityColor(e.category)"
            >
              {{ e.text }} <span class="opacity-60">{{ e.category }}</span>
            </span>
          </div>
        </div>

        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 class="text-sm font-semibold text-green-400 mb-3">✍️ Article enrichi</h3>
          <p class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{{ result.enriched }}</p>
        </div>
      </template>

      <!-- Image result -->
      <div v-if="result.type === 'image'" class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 class="text-sm font-semibold text-orange-400 mb-3">🖼️ Analyse d'image</h3>
        <div v-if="result.result?.tags?.length" class="mb-3">
          <p class="text-xs text-gray-400 mb-2">Tags</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in result.result.tags" :key="t" class="text-xs bg-gray-800 px-2 py-1 rounded">{{ t }}</span>
          </div>
        </div>
        <div v-if="result.result?.text_extracted?.length">
          <p class="text-xs text-gray-400 mb-2">Texte extrait (OCR)</p>
          <p class="text-sm text-gray-300">{{ result.result.text_extracted.join(' ') }}</p>
        </div>
        <div v-if="result.result?.analysis" class="mt-3">
          <p class="text-xs text-gray-400 mb-2">Analyse GPT-4o</p>
          <p class="text-sm text-gray-200">{{ result.result.analysis }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { apiFetch } = useApi()
const text = ref('')
const imageFile = ref(null)
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const onImageChange = (e) => {
  imageFile.value = e.target.files[0]
}

const analyze = async () => {
  loading.value = true
  error.value = null
  result.value = null

  const form = new FormData()
  if (text.value) form.append('text', text.value)
  if (imageFile.value) form.append('file', imageFile.value)

  try {
    result.value = await apiFetch('/api/v1/analyze/', { method: 'POST', body: form })
  } catch (e) {
    error.value = e.message || 'Erreur lors de l\'analyse'
  } finally {
    loading.value = false
  }
}

const sentimentColor = (s) => ({
  'positive': 'text-green-400',
  'negative': 'text-red-400',
  'neutral': 'text-gray-400',
  'mixed': 'text-yellow-400'
}[s] || 'text-gray-400')

const entityColor = (cat) => ({
  'Person': 'border-blue-700 text-blue-300',
  'Organization': 'border-green-700 text-green-300',
  'Location': 'border-purple-700 text-purple-300',
  'Event': 'border-yellow-700 text-yellow-300',
}[cat] || 'border-gray-700 text-gray-300')
</script>
