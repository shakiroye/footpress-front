<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-2xl font-bold mb-2">⚙️ Pipeline Complet</h1>
    <p class="text-gray-400 mb-6 text-sm">Générez des articles, détectez les incohérences, synthétisez vos sources.</p>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button v-for="t in tabs" :key="t.id" @click="activeTab = t.id"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === t.id ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'">
        {{ t.label }}
      </button>
    </div>

    <!-- TAB 1 : Générer article -->
    <div v-if="activeTab === 'article'">
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-4">
        <label class="text-xs text-gray-400 mb-2 block">Notes brutes du journaliste</label>
        <textarea v-model="notes" placeholder="Ex: PSG 2-1 Bayern. Mbappé doublé (23, 67). Kane 81. Donnarumma 7 arrêts. Possession PSG 48%."
          class="w-full bg-gray-800 rounded-lg p-4 text-sm resize-none h-28 outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500" />
        <div class="flex items-center gap-3 mt-3">
          <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input type="checkbox" v-model="useRag" class="accent-green-500" />
            Enrichir avec archives RAG
          </label>
          <button @click="generateArticle" :disabled="!notes || genLoading"
            class="ml-auto bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold px-6 py-2 rounded-lg text-sm transition-colors">
            {{ genLoading ? 'Génération...' : 'Générer l\'article →' }}
          </button>
        </div>
      </div>
      <div v-if="articleResult" class="space-y-4">
        <div class="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 class="text-sm font-semibold text-green-400 mb-3">✍️ Article généré</h3>
          <p class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{{ articleResult.article }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p class="text-gray-400 mb-2">Entités extraites</p>
            <div class="space-y-1">
              <p><span class="text-blue-400">Joueurs :</span> {{ articleResult.pipeline_steps.entities_extracted.persons.join(', ') || '—' }}</p>
              <p><span class="text-green-400">Clubs :</span> {{ articleResult.pipeline_steps.entities_extracted.organizations.join(', ') || '—' }}</p>
              <p><span class="text-yellow-400">Événements :</span> {{ articleResult.pipeline_steps.entities_extracted.events.join(', ') || '—' }}</p>
            </div>
          </div>
          <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <p class="text-gray-400 mb-2">Enrichissement RAG</p>
            <p class="text-green-400">{{ articleResult.pipeline_steps.rag_enrichment.used ? '✅ Utilisé' : '⬜ Non utilisé' }}</p>
            <p v-if="articleResult.pipeline_steps.rag_enrichment.sources?.length" class="text-gray-500 mt-1">
              {{ articleResult.pipeline_steps.rag_enrichment.sources.length }} source(s) consultée(s)
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2 : Fact-checker -->
    <div v-if="activeTab === 'coherence'">
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-4 space-y-4">
        <div>
          <label class="text-xs text-gray-400 mb-2 block">Article rédigé à vérifier</label>
          <textarea v-model="article" placeholder="Collez l'article à fact-checker..."
            class="w-full bg-gray-800 rounded-lg p-4 text-sm resize-none h-28 outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500" />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-2 block">Statistiques officielles de référence</label>
          <textarea v-model="stats" placeholder="Ex: Score PSG 2-1 Bayern. Mbappé 2 buts. Possession PSG 48%..."
            class="w-full bg-gray-800 rounded-lg p-4 text-sm resize-none h-20 outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500" />
        </div>
        <button @click="checkCoherence" :disabled="!article || !stats || checkLoading"
          class="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-2 rounded-lg text-sm transition-colors">
          {{ checkLoading ? 'Analyse...' : '🔍 Détecter les incohérences →' }}
        </button>
      </div>
      <div v-if="coherenceResult" class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-orange-400">📋 Rapport de fact-checking</h3>
          <div class="flex items-center gap-2 text-xs">
            <span class="capitalize" :class="sentimentColor(coherenceResult.article_sentiment)">
              Sentiment : {{ coherenceResult.article_sentiment }}
            </span>
          </div>
        </div>
        <pre class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">{{ coherenceResult.coherence_report }}</pre>
      </div>
    </div>

    <!-- TAB 3 : Synthèse -->
    <div v-if="activeTab === 'synthesize'">
      <div class="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-4 space-y-4">
        <div>
          <label class="text-xs text-gray-400 mb-2 block">Question</label>
          <input v-model="synthQuestion" placeholder="Ex: Quel joueur a été le plus décisif sur ces matchs ?"
            class="w-full bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500" />
        </div>
        <div>
          <label class="text-xs text-gray-400 mb-2 block">Sources (noms de fichiers séparés par des virgules)</label>
          <input v-model="synthSources" placeholder="Ex: match_psg.pdf,match_real.pdf"
            class="w-full bg-gray-800 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500" />
        </div>
        <button @click="synthesize" :disabled="!synthQuestion || !synthSources || synthLoading"
          class="w-full bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-semibold py-2 rounded-lg text-sm transition-colors">
          {{ synthLoading ? 'Synthèse en cours...' : '🔗 Synthétiser →' }}
        </button>
      </div>
      <div v-if="synthResult" class="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-purple-400">📊 Synthèse multi-sources</h3>
          <span class="text-xs text-gray-500">{{ synthResult.sources_consulted?.length }} source(s)</span>
        </div>
        <p class="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{{ synthResult.synthesis }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { apiFetch } = useApi()
const activeTab = ref('article')
const tabs = [
  { id: 'article', label: '✍️ Générer article' },
  { id: 'coherence', label: '🔍 Fact-checker' },
  { id: 'synthesize', label: '🔗 Synthèse' },
]

// Tab 1
const notes = ref('')
const useRag = ref(true)
const genLoading = ref(false)
const articleResult = ref(null)

// Tab 2
const article = ref('')
const stats = ref('')
const checkLoading = ref(false)
const coherenceResult = ref(null)

// Tab 3
const synthQuestion = ref('')
const synthSources = ref('')
const synthLoading = ref(false)
const synthResult = ref(null)

const generateArticle = async () => {
  genLoading.value = true
  articleResult.value = null
  const form = new FormData()
  form.append('notes', notes.value)
  form.append('use_rag', useRag.value)
  try {
    articleResult.value = await apiFetch('/api/v1/pipeline/generate-article', { method: 'POST', body: form })
  } finally { genLoading.value = false }
}

const checkCoherence = async () => {
  checkLoading.value = true
  coherenceResult.value = null
  const form = new FormData()
  form.append('article', article.value)
  form.append('stats', stats.value)
  try {
    coherenceResult.value = await apiFetch('/api/v1/pipeline/check-coherence', { method: 'POST', body: form })
  } finally { checkLoading.value = false }
}

const synthesize = async () => {
  synthLoading.value = true
  synthResult.value = null
  const form = new FormData()
  form.append('question', synthQuestion.value)
  form.append('sources', synthSources.value)
  try {
    synthResult.value = await apiFetch('/api/v1/pipeline/synthesize', { method: 'POST', body: form })
  } finally { synthLoading.value = false }
}

const sentimentColor = (s) => ({ positive: 'text-green-400', negative: 'text-red-400', neutral: 'text-gray-400', mixed: 'text-yellow-400' }[s] || 'text-gray-400')
</script>
