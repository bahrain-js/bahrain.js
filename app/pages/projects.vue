<script setup lang="ts">
const client = useNeonClient()

// Types for project data
interface Project {
  id: string
  name: string
  slug: string
  description: string
  stack: string[]
  stars: number
  stage: 'idea' | 'prototype' | 'repo' | 'package'
  featured: boolean
  start_here: boolean
  npm_package?: string
  url: string
  status: string
}

// Fetch projects from database
const dbProjects = ref<Project[]>([])
const dbLoading = ref(true)

async function fetchProjects() {
  dbLoading.value = true
  try {
    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (error) throw error
    dbProjects.value = data || []
  } catch (err) {
    console.error('Failed to load projects:', err)
    dbProjects.value = []
  } finally {
    dbLoading.value = false
  }
}

onMounted(fetchProjects)

// Fetch live data from GitHub API (non-blocking — page renders with DB data immediately)
const { data: githubRepos } = useGitHubRepos()

// Merge GitHub stars into DB projects
const projects = computed(() => {
  if (!githubRepos.value?.length) return dbProjects.value

  return dbProjects.value.map((project) => {
    const repoName = project.url?.split('/').pop()
    const ghRepo = (githubRepos.value ?? []).find(r => r.name === repoName)
    if (ghRepo) {
      return { ...project, stars: ghRepo.stars }
    }
    return project
  })
})

// Find additional repos from GitHub not in DB list
const additionalRepos = computed(() => {
  if (!githubRepos.value?.length) return []
  const dbNames = dbProjects.value.map(p => p.url?.split('/').pop())
  return githubRepos.value.filter(r => !dbNames.includes(r.name))
})

const stageConfig: Record<string, { icon: string, label: string, color: string }> = {
  idea: { icon: 'i-lucide-lightbulb', label: 'Idea', color: 'text-zinc-400' },
  prototype: { icon: 'i-lucide-flask-conical', label: 'Prototype', color: 'text-blue-500' },
  repo: { icon: 'i-lucide-git-branch', label: 'Active Repo', color: 'text-green-500' },
  package: { icon: 'i-lucide-package', label: 'Published', color: 'text-yellow-500' }
}

const pipelineStages = [
  { key: 'idea', icon: 'i-lucide-lightbulb', label: 'Idea', description: 'Discussed at meetups or in chat' },
  { key: 'prototype', icon: 'i-lucide-flask-conical', label: 'Prototype', description: 'Working proof of concept' },
  { key: 'repo', icon: 'i-lucide-git-branch', label: 'Active Repo', description: 'Under bahrain-js org' },
  { key: 'package', icon: 'i-lucide-package', label: 'Published', description: 'On npm as @bahrain.js/*' }
]

const featuredProjects = computed(() => projects.value.filter(p => p.featured))
const startHereProjects = computed(() => projects.value.filter(p => p.start_here))
const allProjects = computed(() => projects.value)

// ─── Search & Filter ───
const searchQuery = ref('')
const selectedStage = ref('all')

const stageOptions = [
  { label: 'All Stages', value: 'all' },
  { label: 'Idea', value: 'idea' },
  { label: 'Prototype', value: 'prototype' },
  { label: 'Active Repo', value: 'repo' },
  { label: 'Published', value: 'package' }
]

const filteredProjects = computed(() => {
  return allProjects.value.filter((p) => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q
      || p.name.toLowerCase().includes(q)
      || (p.description || '').toLowerCase().includes(q)
      || (p.stack || []).some(s => s.toLowerCase().includes(q))

    const matchesStage = selectedStage.value === 'all' || p.stage === selectedStage.value

    return matchesSearch && matchesStage
  })
})

useSeoMeta({
  title: 'Projects — Bahrain.js',
  description: 'Open source JavaScript projects from the Bahrain.js community. Contribute to existing repos or start your own under the @bahrain.js org.'
})
</script>

<template>
  <UContainer class="py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Projects
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
        Everything we build lives in the open. Explore, contribute, or pitch your own idea.
      </p>
    </div>

    <!-- Open Source Pipeline -->
    <section class="mb-16">
      <h2 class="text-xl font-bold mb-6 text-center">
        How ideas become packages
      </h2>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
        <div
          v-for="(stage, i) in pipelineStages"
          :key="stage.key"
          class="flex items-center gap-2 sm:gap-0"
        >
          <div class="flex flex-col items-center text-center gap-1.5 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 min-w-[120px]">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-950/30">
              <UIcon
                :name="stage.icon"
                class="size-5 text-yellow-600 dark:text-yellow-400"
              />
            </div>
            <span class="text-sm font-semibold">{{ stage.label }}</span>
            <span class="text-xs text-zinc-400 dark:text-zinc-500">{{ stage.description }}</span>
          </div>
          <UIcon
            v-if="i < pipelineStages.length - 1"
            name="i-lucide-arrow-right"
            class="size-5 text-zinc-300 dark:text-zinc-600 hidden sm:block mx-2"
          />
          <UIcon
            v-if="i < pipelineStages.length - 1"
            name="i-lucide-arrow-down"
            class="size-5 text-zinc-300 dark:text-zinc-600 sm:hidden"
          />
        </div>
      </div>
    </section>

    <!-- Loading Skeletons -->
    <div
      v-if="dbLoading"
      class="space-y-6 mb-16"
    >
      <USkeleton class="h-6 w-32" />
      <div class="grid gap-6">
        <USkeleton
          v-for="i in 3"
          :key="i"
          class="h-40 rounded-xl"
        />
      </div>
    </div>

    <template v-else>
    <!-- Featured Projects -->
    <section
      v-if="featuredProjects.length"
      class="mb-16"
    >
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <UIcon
          name="i-lucide-star"
          class="text-yellow-500"
        />
        Featured
      </h2>
      <div class="grid gap-6">
        <UCard
          v-for="project in featuredProjects"
          :key="project.slug"
          class="hover:ring-2 hover:ring-yellow-400/50 transition-all"
        >
          <div class="flex flex-col gap-4">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    :class="stageConfig[project.stage]?.color"
                    class="inline-flex items-center gap-1 text-xs font-medium"
                  >
                    <UIcon
                      :name="stageConfig[project.stage]?.icon"
                      class="size-3.5"
                    />
                    {{ stageConfig[project.stage]?.label }}
                  </span>
                </div>
                <a
                  :href="project.url"
                  target="_blank"
                  class="group"
                >
                  <h3 class="text-xl font-bold group-hover:text-yellow-500 transition-colors">
                    {{ project.name }}
                  </h3>
                </a>
                <p class="text-zinc-500 dark:text-zinc-400 mt-1">
                  {{ project.description }}
                </p>
              </div>
              <div class="flex items-center gap-1 text-sm text-zinc-400 shrink-0">
                <UIcon
                  name="i-lucide-star"
                  class="size-4"
                />
                {{ project.stars }}
              </div>
            </div>

            <!-- Tech stack -->
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tech in project.stack"
                :key="tech"
                class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {{ tech }}
              </span>
            </div>

            <!-- Contributors -->
            <div class="flex items-center justify-between">
              <div class="flex -space-x-2">
                <img
                  src="https://github.com/bahrain-js.png?size=64"
                  alt="bahrain-js"
                  class="size-7 rounded-full ring-2 ring-white dark:ring-zinc-900"
                >
              </div>
              <UButton
                :to="project.url"
                target="_blank"
                label="View on GitHub"
                icon="i-simple-icons-github"
                variant="outline"
                size="xs"
              />
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <!-- Start Here -->
    <section
      v-if="startHereProjects.length"
      class="mb-16"
    >
      <h2 class="text-2xl font-bold mb-2 flex items-center gap-2">
        <UIcon
          name="i-lucide-rocket"
          class="text-green-500"
        />
        Start Here
      </h2>
      <p class="text-zinc-500 dark:text-zinc-400 mb-6">
        New to open source? These repos have clear contributing guides and welcoming maintainers.
      </p>
      <div class="grid sm:grid-cols-2 gap-4">
        <UCard
          v-for="project in startHereProjects"
          :key="project.slug"
          class="hover:ring-2 hover:ring-green-400/30 transition-all"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
              <span
                :class="stageConfig[project.stage]?.color"
                class="inline-flex items-center gap-1 text-xs font-medium"
              >
                <UIcon
                  :name="stageConfig[project.stage]?.icon"
                  class="size-3"
                />
                {{ stageConfig[project.stage]?.label }}
              </span>
            </div>
            <a
              :href="project.url"
              target="_blank"
              class="group"
            >
              <h3 class="font-semibold group-hover:text-yellow-500 transition-colors">
                {{ project.name }}
              </h3>
            </a>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">
              {{ project.description }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tech in project.stack"
                :key="tech"
                class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {{ tech }}
              </span>
            </div>
            <UButton
              :to="project.url"
              target="_blank"
              label="Contribute"
              icon="i-lucide-git-pull-request"
              variant="soft"
              size="xs"
              class="self-start"
            />
          </div>
        </UCard>
      </div>
    </section>

    <!-- All Projects -->
    <section>
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
        <UIcon
          name="i-lucide-folder-git-2"
          class="text-zinc-400"
        />
        All Projects
      </h2>

      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          placeholder="Search projects..."
          class="flex-1"
        />
        <USelect
          v-model="selectedStage"
          :items="stageOptions"
          class="w-full sm:w-48"
          :ui="{ content: 'min-w-fit' }"
        />
      </div>

      <div class="grid gap-4">
        <UCard
          v-for="project in filteredProjects"
          :key="project.slug"
        >
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span
                  :class="stageConfig[project.stage]?.color"
                  class="inline-flex items-center gap-1 text-xs font-medium"
                >
                  <UIcon
                    :name="stageConfig[project.stage]?.icon"
                    class="size-3"
                  />
                  {{ stageConfig[project.stage]?.label }}
                </span>
                <span
                  v-if="project.npm_package"
                  class="text-xs text-zinc-400"
                >
                  · {{ project.npm_package }}
                </span>
              </div>
              <a
                :href="project.url"
                target="_blank"
                class="group"
              >
                <h3 class="font-medium group-hover:text-yellow-500 transition-colors">
                  {{ project.name }}
                </h3>
              </a>
              <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {{ project.description }}
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="flex -space-x-1.5">
                <img
                  src="https://github.com/bahrain-js.png?size=64"
                  alt="bahrain-js"
                  class="size-6 rounded-full ring-2 ring-white dark:ring-zinc-900"
                >
              </div>
              <span class="flex items-center gap-1 text-sm text-zinc-400">
                <UIcon
                  name="i-lucide-star"
                  class="size-3.5"
                />
                {{ project.stars }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Additional GitHub repos not in static list -->
        <UCard
          v-for="repo in additionalRepos"
          :key="repo.name"
        >
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="inline-flex items-center gap-1 text-xs font-medium text-green-500">
                  <UIcon
                    name="i-lucide-git-branch"
                    class="size-3"
                  />
                  Active Repo
                </span>
                <span
                  v-if="repo.language"
                  class="text-xs text-zinc-400"
                >
                  · {{ repo.language }}
                </span>
              </div>
              <a
                :href="repo.url"
                target="_blank"
                class="group"
              >
                <h3 class="font-medium group-hover:text-yellow-500 transition-colors">
                  {{ repo.name }}
                </h3>
              </a>
              <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                {{ repo.description }}
              </p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="flex items-center gap-1 text-sm text-zinc-400">
                <UIcon
                  name="i-lucide-star"
                  class="size-3.5"
                />
                {{ repo.stars }}
              </span>
            </div>
          </div>
        </UCard>
      </div>
    </section>

    <!-- CTA -->
    <section class="mt-16 text-center py-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30">
      <h2 class="text-2xl font-bold mb-2">
        Got something to build?
      </h2>
      <p class="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
        Bring your idea to a meetup or builder session — we'll help you ship it under @bahrain.js.
      </p>
      <div class="flex justify-center gap-3">
        <UButton
          to="/events"
          label="Upcoming events"
          icon="i-lucide-calendar"
          size="lg"
        />
        <UButton
          to="/blog/2026-03-10-how-to-contribute"
          label="How to contribute"
          icon="i-lucide-book-open"
          variant="outline"
          size="lg"
        />
      </div>
    </section>
    </template>
  </UContainer>
</template>
