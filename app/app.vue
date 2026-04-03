<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <nav class="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-6">
      <span class="text-xl font-bold text-green-400">⚽ FootPress AI</span>
      <NuxtLink to="/" class="text-sm hover:text-green-400 transition-colors">Playground</NuxtLink>
      <NuxtLink to="/rag" class="text-sm hover:text-green-400 transition-colors">Archives RAG</NuxtLink>
      <NuxtLink to="/pipeline" class="text-sm hover:text-green-400 transition-colors">Pipeline</NuxtLink>
      <NuxtLink to="/metrics" class="text-sm hover:text-green-400 transition-colors">Métriques</NuxtLink>
      <span class="ml-auto text-xs text-gray-500">🟢 API Live</span>
    </nav>
    <NuxtPage />
  </div>
</template>
