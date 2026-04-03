<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-2">📚 Archives RAG</h1>
    <p class="text-gray-400 mb-6 text-sm">Uploadez vos PDFs et interrogez vos archives avec la recherche vectorielle.</p>

    <div class="grid grid-cols-2 gap-6 mb-6">
      <!-- Upload -->
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 class="font-semibold mb-4 text-sm">📤 Uploader un PDF</h2>
        <label class="block w-full border-2 border-dashed border-gray-700 hover:border-green-600 rounded-lg p-6 text-center cursor-pointer transition-colors">
          <p class="text-gray-400 text-sm mb-1">{{ uploadFile ? uploadFile.name : 'Glissez un PDF ici' }}</p>
          <p class="text-xs text-gray-600">max 10 MB</p>
          <input type="file" accept=".pdf" class="hidden" @change="onUploadChange" />
        </label>
        <button
          @click="upload"
          :disabled="!uploadFile || uploading"
          class="mt-4 w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-2 rounded-lg text-sm transition-colors"
        >
          {{ uploading ? 'Upload en cours...' : 'Indexer →' }}
        </button>
        <div v-if="uploadResult" class="mt-3 text-xs p-3 rounded-lg" :class="uploadResult.indexation?.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'">
          <span v-if="uploadResult.indexation?.success">
            ✅ {{ uploadResult.indexation.total_chunks }} chunk(s) indexé(s)
          </span>
          <span v-else>❌ {{ uploadResult.indexation?.error }}</span>
        </div>
      </div>

      <!-- Files -->
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 class="font-semibold mb-4 text-sm">🗂️ Fichiers indexés</h2>
        <div v-if="files.length === 0" class="text-gray-600 text-sm">Aucun fichier uploadé</div>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          <div v-for="f in files" :key="f.name" class="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2 text-xs">
            <span class="text-gray-300 truncate">📄 {{ f.name }}</span>
            <span class="text-gray-500 ml-2 shrink-0">{{ Math.round(f.size / 1024) }} KB</span>
          </div>
        </div>
        <button @click="loadFiles" class="mt-3 text-xs text-gray-500 hover:text-green-400 transition-colors">↻ Rafraîchir</button>
      </div>
    </div>

    <!-- Query -->
    <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
      <h2 class="font-semibold mb-4 text-sm">🔍 Interroger les archives</h2>
      <input
        v-model="question"
        placeholder="Ex: Comment Mbappé a performé lors du match PSG vs Bayern ?"
        class="w-full bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
        @keyup.enter="query"
      />
      <div class="flex gap-3 mt-3">
        <input
          v-model="sourceFilter"
          placeholder="Filtrer par fichier (optionnel)"
          class="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
        />
        <button
          @click="query"
          :disabled="!question || querying"
          class="bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
        >
          {{ querying ? '...' : 'Rechercher →' }}
        </button>
      </div>
    </div>

    <!-- Query result -->
    <div v-if="queryResult" class="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-green-400">💬 Réponse</h3>
        <span class="text-xs text-gray-500">{{ queryResult.nb_chunks_retrieved }} chunk(s) utilisé(s)</span>
      </div>
      <p class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">{{ queryResult.answer }}</p>
      <div v-if="queryResult.sources_used?.length" class="border-t border-gray-800 pt-3">
        <p class="text-xs text-gray-500 mb-2">Sources utilisées :</p>
        <div class="flex flex-wrap gap-2">
          <span v-for="s in queryResult.sources_used" :key="s.file+s.chunk" class="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
            📄 {{ s.file }} #{{ s.chunk }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const uploadFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const files = ref([])
const question = ref('')
const sourceFilter = ref('')
const querying = ref(false)
const queryResult = ref(null)

onMounted(() => loadFiles())

const onUploadChange = (e) => { uploadFile.value = e.target.files[0] }

const upload = async () => {
  uploading.value = true
  uploadResult.value = null
  const form = new FormData()
  form.append('file', uploadFile.value)
  try {
    uploadResult.value = await $fetch(`${config.public.apiBase}/api/v1/rag/upload`, { method: 'POST', body: form })
    await loadFiles()
  } catch(e) {
    uploadResult.value = { indexation: { success: false, error: e.message } }
  } finally {
    uploading.value = false
  }
}

const loadFiles = async () => {
  try {
    const data = await $fetch(`${config.public.apiBase}/api/v1/rag/files`)
    files.value = data.files || []
  } catch {}
}

const query = async () => {
  querying.value = true
  queryResult.value = null
  const form = new FormData()
  form.append('question', question.value)
  if (sourceFilter.value) form.append('source', sourceFilter.value)
  try {
    queryResult.value = await $fetch(`${config.public.apiBase}/api/v1/rag/query`, { method: 'POST', body: form })
  } catch(e) {
    queryResult.value = { answer: `Erreur : ${e.message}`, sources_used: [], nb_chunks_retrieved: 0 }
  } finally {
    querying.value = false
  }
}
</script>
