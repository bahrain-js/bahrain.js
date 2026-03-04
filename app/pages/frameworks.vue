<script setup lang="ts">
const client = useNeonClient()

// All JS frameworks with logos and metadata
const frameworks = [
  { name: 'Vue', icon: 'i-simple-icons-vuedotjs', color: 'text-emerald-500', category: 'Frontend', url: 'https://vuejs.org' },
  { name: 'React', icon: 'i-simple-icons-react', color: 'text-sky-400', category: 'Frontend', url: 'https://react.dev' },
  { name: 'Angular', icon: 'i-simple-icons-angular', color: 'text-red-500', category: 'Frontend', url: 'https://angular.dev' },
  { name: 'Svelte', icon: 'i-simple-icons-svelte', color: 'text-orange-500', category: 'Frontend', url: 'https://svelte.dev' },
  { name: 'Solid', icon: 'i-simple-icons-solid', color: 'text-blue-500', category: 'Frontend', url: 'https://solidjs.com' },

  { name: 'Nuxt', icon: 'i-simple-icons-nuxtdotjs', color: 'text-green-400', category: 'Full-Stack', url: 'https://nuxt.com' },
  { name: 'Next.js', icon: 'i-simple-icons-nextdotjs', color: 'text-white', category: 'Full-Stack', url: 'https://nextjs.org' },
  { name: 'Remix', icon: 'i-simple-icons-remix', color: 'text-blue-400', category: 'Full-Stack', url: 'https://remix.run' },
  { name: 'SvelteKit', icon: 'i-simple-icons-svelte', color: 'text-orange-400', category: 'Full-Stack', url: 'https://svelte.dev/docs/kit' },

  { name: 'Astro', icon: 'i-simple-icons-astro', color: 'text-orange-400', category: 'Frontend', url: 'https://astro.build' },

  { name: 'Express', icon: 'i-simple-icons-express', color: 'text-zinc-400', category: 'Backend', url: 'https://expressjs.com' },
  { name: 'Fastify', icon: 'i-simple-icons-fastify', color: 'text-zinc-300', category: 'Backend', url: 'https://fastify.dev' },
  { name: 'Hono', icon: 'i-simple-icons-hono', color: 'text-orange-500', category: 'Backend', url: 'https://hono.dev' },
  { name: 'Nitro', icon: 'i-simple-icons-nuxtdotjs', color: 'text-green-500', category: 'Backend', url: 'https://nitro.build' },
  { name: 'Elysia', icon: 'i-lucide-zap', color: 'text-purple-400', category: 'Backend', url: 'https://elysiajs.com' },

  { name: 'Node.js', icon: 'i-simple-icons-nodedotjs', color: 'text-green-500', category: 'Runtime', url: 'https://nodejs.org' },
  { name: 'Deno', icon: 'i-simple-icons-deno', color: 'text-zinc-300', category: 'Runtime', url: 'https://deno.com' },
  { name: 'Bun', icon: 'i-simple-icons-bun', color: 'text-amber-300', category: 'Runtime', url: 'https://bun.sh' },

  { name: 'React Native', icon: 'i-simple-icons-react', color: 'text-sky-400', category: 'Mobile', url: 'https://reactnative.dev' },
  { name: 'Expo', icon: 'i-simple-icons-expo', color: 'text-zinc-300', category: 'Mobile', url: 'https://expo.dev' },

  { name: 'Electron', icon: 'i-simple-icons-electron', color: 'text-blue-300', category: 'Desktop', url: 'https://electronjs.org' },
  { name: 'Tauri', icon: 'i-simple-icons-tauri', color: 'text-yellow-400', category: 'Desktop', url: 'https://tauri.app' },

  { name: 'TypeScript', icon: 'i-simple-icons-typescript', color: 'text-blue-500', category: 'Language', url: 'https://typescriptlang.org' }
]

const categories = [...new Set(frameworks.map(f => f.category))]
const selectedCategory = ref('')

const filteredFrameworks = computed(() => {
  if (!selectedCategory.value) return frameworks
  return frameworks.filter(f => f.category === selectedCategory.value)
})

// Load community favorites from member profiles
const memberFavorites = ref<Record<string, number>>({})
const loadingFavorites = ref(true)

async function loadFavorites() {
  loadingFavorites.value = true
  try {
    const { data } = await client
      .from('members')
      .select('favorite_frameworks')

    if (data) {
      const counts: Record<string, number> = {}
      for (const member of data) {
        if (member.favorite_frameworks) {
          for (const fw of member.favorite_frameworks) {
            counts[fw] = (counts[fw] || 0) + 1
          }
        }
      }
      memberFavorites.value = counts
    }
  } catch {
    // Silently fail - this is supplementary data
  } finally {
    loadingFavorites.value = false
  }
}

// Top frameworks by community votes
const topFrameworks = computed(() => {
  return Object.entries(memberFavorites.value)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
})

onMounted(() => {
  loadFavorites()
})

useSeoMeta({
  title: 'Frameworks — Bahrain.js',
  description: 'Explore JavaScript frameworks and see what the Bahrain.js community loves building with.'
})
</script>

<template>
  <UContainer class="py-16 space-y-12">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Frameworks
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
        Explore the JavaScript ecosystem and discover what our community loves building with.
      </p>
    </div>

    <!-- Community Favorites -->
    <section
      v-if="topFrameworks.length"
      class="space-y-4"
    >
      <h2 class="text-xl font-bold flex items-center gap-2">
        <UIcon
          name="i-lucide-heart"
          class="text-red-400"
        />
        Community Favorites
      </h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">
        Based on member profiles — add your favorites on your <NuxtLink
          to="/profile"
          class="underline hover:text-white transition-colors"
        >profile page</NuxtLink>.
      </p>
      <div class="flex flex-wrap gap-3">
        <UCard
          v-for="[name, count] in topFrameworks"
          :key="name"
          class="inline-flex items-center gap-2 px-4 py-2"
        >
          <span class="font-semibold">{{ name }}</span>
          <UBadge
            color="primary"
            variant="subtle"
            size="xs"
          >
            {{ count }} {{ count === 1 ? 'member' : 'members' }}
          </UBadge>
        </UCard>
      </div>
    </section>

    <!-- Category filter -->
    <div class="flex flex-wrap gap-2 justify-center">
      <UButton
        label="All"
        :variant="!selectedCategory ? 'solid' : 'outline'"
        size="sm"
        @click="selectedCategory = ''"
      />
      <UButton
        v-for="cat in categories"
        :key="cat"
        :label="cat"
        :variant="selectedCategory === cat ? 'solid' : 'outline'"
        size="sm"
        @click="selectedCategory = selectedCategory === cat ? '' : cat"
      />
    </div>

    <!-- Frameworks grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <a
        v-for="fw in filteredFrameworks"
        :key="fw.name"
        :href="fw.url"
        target="_blank"
        rel="noopener noreferrer"
        class="group"
      >
        <UCard class="text-center hover:ring-2 hover:ring-primary-500/50 transition-all h-full">
          <div class="flex flex-col items-center gap-3 py-2">
            <UIcon
              :name="fw.icon"
              :class="['text-3xl transition-transform group-hover:scale-110', fw.color]"
            />
            <div>
              <p class="font-semibold text-sm">{{ fw.name }}</p>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ fw.category }}</p>
            </div>
            <UBadge
              v-if="memberFavorites[fw.name]"
              color="primary"
              variant="subtle"
              size="xs"
            >
              ♥ {{ memberFavorites[fw.name] }}
            </UBadge>
          </div>
        </UCard>
      </a>
    </div>

    <!-- CTA -->
    <div class="text-center space-y-4 py-8">
      <h2 class="text-xl font-bold">
        Which frameworks do you love?
      </h2>
      <p class="text-zinc-500 dark:text-zinc-400">
        Sign in and add your favorite frameworks to your profile.
      </p>
      <div class="flex gap-3 justify-center">
        <UButton
          to="/profile"
          icon="i-lucide-user"
          label="Edit Profile"
          color="primary"
        />
        <UButton
          to="/people"
          icon="i-lucide-users"
          label="See People"
          variant="outline"
        />
      </div>
    </div>
  </UContainer>
</template>
