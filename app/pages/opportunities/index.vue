<script setup lang="ts">
const { isAuthenticated, signInWithGitHub } = useAuth()
const client = useNeonClient()

useSeoMeta({
  title: 'Opportunities — Bahrain.js',
  description: 'JavaScript and web development opportunities in Bahrain. Jobs, freelance gigs, and open source contributions.'
})

// ─── Fetch from DB ───
const jobs = ref<any[]>([])
const ossOpportunities = ref<any[]>([])
const startupIdeas = ref<any[]>([])
const loading = ref(true)

async function fetchOpportunities() {
  try {
    const [jobsRes, ossRes, ideasRes] = await Promise.all([
      client.from('opportunities').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      client.from('open_source_opportunities').select('*').eq('status', 'active').order('created_at', { ascending: false }),
      client.from('startup_ideas').select('*').eq('status', 'approved').order('created_at', { ascending: false })
    ])
    jobs.value = jobsRes.data || []
    ossOpportunities.value = ossRes.data || []
    startupIdeas.value = ideasRes.data || []
  } catch (err) {
    console.error('Failed to load opportunities:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOpportunities)

const resources = [
  { icon: 'i-lucide-briefcase', title: 'Bahrain Tech Jobs', url: 'https://www.linkedin.com/jobs/search/?location=Bahrain&keywords=javascript', description: 'JavaScript jobs in Bahrain on LinkedIn' },
  { icon: 'i-lucide-globe', title: 'Remote JS Jobs', url: 'https://remotejs.com', description: 'Remote JavaScript positions worldwide' },
  { icon: 'i-lucide-code', title: 'Good First Issues', url: 'https://goodfirstissues.com', description: 'Find your first open source contribution' }
]

const difficultyColor: Record<string, string> = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'warning'
}
</script>

<template>
  <UContainer class="py-16 space-y-16">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Opportunities
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
        JavaScript and web development opportunities in Bahrain. Jobs, contributions, and ways to level up.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 text-muted animate-spin"
      />
    </div>

    <template v-else>
      <!-- Open Source Contributions -->
      <section>
        <h2 class="text-2xl font-bold mb-2 flex items-center gap-2">
          <UIcon
            name="i-lucide-git-pull-request"
            class="text-green-500"
          />
          Contribute to Open Source
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 mb-6">
          The best way to build your portfolio and skills. Real projects, real impact.
        </p>
        <div
          v-if="ossOpportunities.length"
          class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <UCard
            v-for="opp in ossOpportunities"
            :key="opp.id"
            class="hover:ring-2 hover:ring-green-400/30 transition-all"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <a
                  :href="opp.url"
                  target="_blank"
                  class="group"
                >
                  <h3 class="font-semibold group-hover:text-primary transition-colors">
                    {{ opp.project_name }}
                  </h3>
                </a>
                <UBadge
                  :color="(difficultyColor[opp.difficulty] || 'neutral') as any"
                  variant="subtle"
                  size="xs"
                >
                  {{ opp.difficulty }}
                </UBadge>
              </div>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                {{ opp.description }}
              </p>
              <p
                v-if="opp.issues_label"
                class="text-xs text-primary"
              >
                {{ opp.issues_label }}
              </p>
              <div
                v-if="opp.tags?.length"
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="tag in opp.tags"
                  :key="tag"
                  class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {{ tag }}
                </span>
              </div>
              <UButton
                v-if="opp.url"
                :to="opp.url"
                target="_blank"
                label="View on GitHub"
                icon="i-simple-icons-github"
                variant="outline"
                size="xs"
                class="self-start"
              />
            </div>
          </UCard>
        </div>
        <div
          v-else
          class="text-center py-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/30"
        >
          <p class="text-zinc-500 dark:text-zinc-400">
            No open source opportunities yet.
          </p>
        </div>
      </section>

      <!-- Startup Ideas -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon
              name="i-lucide-lightbulb"
              class="text-orange-500"
            />
            Startup Ideas Looking for Founders
          </h2>
          <UButton
            v-if="isAuthenticated"
            to="/opportunities/submit-idea"
            label="Share an Idea"
            icon="i-lucide-plus"
            size="sm"
            variant="outline"
          />
          <UButton
            v-else
            label="Sign in to share"
            icon="i-lucide-log-in"
            size="sm"
            variant="ghost"
            @click="signInWithGitHub"
          />
        </div>
        <p class="text-zinc-500 dark:text-zinc-400 mb-6">
          Bahrain-focused startup ideas that need technical co-founders or founding team members.
        </p>
        <div
          v-if="startupIdeas.length"
          class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <UCard
            v-for="idea in startupIdeas"
            :key="idea.id"
            class="hover:ring-2 hover:ring-orange-400/30 transition-all"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold">
                  {{ idea.title }}
                </h3>
                <UBadge
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  {{ idea.looking_for }}
                </UBadge>
              </div>
              <p
                v-if="idea.problem"
                class="text-sm text-orange-600 dark:text-orange-400 font-medium"
              >
                ⚡ {{ idea.problem }}
              </p>
              <p class="text-sm text-zinc-500 dark:text-zinc-400">
                {{ idea.description }}
              </p>
              <div class="flex items-center gap-2">
                <UBadge
                  v-if="idea.sector"
                  color="neutral"
                  variant="outline"
                  size="xs"
                >
                  {{ idea.sector }}
                </UBadge>
              </div>
              <div
                v-if="idea.tags?.length"
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="tag in idea.tags"
                  :key="tag"
                  class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                >
                  {{ tag }}
                </span>
              </div>
              <UButton
                v-if="idea.contact_url"
                :to="idea.contact_url"
                target="_blank"
                label="Get in Touch"
                icon="i-lucide-message-circle"
                variant="outline"
                size="xs"
                class="self-start"
              />
            </div>
          </UCard>
        </div>
        <div
          v-else
          class="text-center py-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/30"
        >
          <p class="text-zinc-500 dark:text-zinc-400">
            No startup ideas posted yet.
          </p>
        </div>
      </section>

      <!-- Job Listings -->
      <section>
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <UIcon
              name="i-lucide-briefcase"
              class="text-yellow-500"
            />
            Job Listings
          </h2>
          <UButton
            v-if="isAuthenticated"
            to="/opportunities/submit-job"
            label="Submit a Job"
            icon="i-lucide-plus"
            size="sm"
            variant="outline"
          />
          <UButton
            v-else
            label="Sign in to post"
            icon="i-lucide-log-in"
            size="sm"
            variant="ghost"
            @click="signInWithGitHub"
          />
        </div>
        <p class="text-zinc-500 dark:text-zinc-400 mb-6">
          JavaScript and web development positions in Bahrain.
        </p>

        <div
          v-if="jobs.length"
          class="grid gap-4"
        >
          <UCard
            v-for="job in jobs"
            :key="job.id"
            class="hover:ring-2 hover:ring-yellow-400/20 transition-all"
          >
            <div class="flex items-start gap-4">
              <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 flex-shrink-0">
                <UIcon
                  name="i-lucide-briefcase"
                  class="size-6 text-primary"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">
                    {{ job.title }}
                  </h3>
                  <UBadge
                    v-if="job.is_remote"
                    color="info"
                    variant="subtle"
                    size="xs"
                  >
                    Remote
                  </UBadge>
                </div>
                <p
                  v-if="job.company"
                  class="text-sm font-medium text-primary"
                >
                  {{ job.company }}
                </p>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {{ job.description }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-xs text-muted">
                  <span
                    v-if="job.location"
                    class="flex items-center gap-1"
                  >
                    <UIcon
                      name="i-lucide-map-pin"
                      class="size-3"
                    /> {{ job.location }}
                  </span>
                  <span v-if="job.salary_range">{{ job.salary_range }}</span>
                </div>
                <div
                  v-if="job.tags?.length"
                  class="flex flex-wrap gap-1.5 mt-2"
                >
                  <span
                    v-for="tag in job.tags"
                    :key="tag"
                    class="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <UButton
                v-if="job.url"
                :to="job.url"
                target="_blank"
                label="Apply"
                variant="outline"
                size="sm"
                class="flex-shrink-0"
              />
            </div>
          </UCard>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="mt-2 text-center py-8 rounded-xl bg-zinc-50 dark:bg-zinc-800/30"
        >
          <UIcon
            name="i-lucide-search"
            class="size-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3"
          />
          <p class="text-zinc-500 dark:text-zinc-400 font-medium">
            More job listings coming soon
          </p>
          <UButton
            v-if="isAuthenticated"
            to="/opportunities/submit-job"
            label="Submit a Job Listing"
            icon="i-lucide-plus"
            variant="outline"
            size="sm"
            class="mt-3"
          />
          <p
            v-else
            class="text-sm text-zinc-400 dark:text-zinc-500 mt-1"
          >
            Know of a JavaScript role in Bahrain?
            <button
              class="text-primary hover:underline"
              @click="signInWithGitHub"
            >
              Sign in to post
            </button>
          </p>
        </div>
      </section>

      <!-- Resources -->
      <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UIcon
            name="i-lucide-compass"
            class="text-blue-500"
          />
          Job Resources
        </h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <UCard
            v-for="resource in resources"
            :key="resource.title"
            class="hover:ring-2 hover:ring-blue-400/20 transition-all"
          >
            <a
              :href="resource.url"
              target="_blank"
              class="flex items-center gap-3 group"
            >
              <UIcon
                :name="resource.icon"
                class="size-5 text-blue-500 flex-shrink-0"
              />
              <div>
                <p class="font-medium group-hover:text-primary transition-colors">{{ resource.title }}</p>
                <p class="text-xs text-muted">{{ resource.description }}</p>
              </div>
              <UIcon
                name="i-lucide-external-link"
                class="size-4 text-zinc-400 ml-auto flex-shrink-0"
              />
            </a>
          </UCard>
        </div>
      </section>

      <!-- CTA -->
      <section class="text-center py-12 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30">
        <h2 class="text-2xl font-bold mb-2">
          Want to level up?
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
          Join Bahrain.js events, contribute to projects, and connect with developers who are building.
        </p>
        <div class="flex justify-center gap-3">
          <UButton
            to="/events"
            label="Upcoming Events"
            icon="i-lucide-calendar"
            size="lg"
          />
          <UButton
            to="/projects"
            label="View Projects"
            icon="i-lucide-folder-git-2"
            variant="outline"
            size="lg"
          />
        </div>
      </section>
    </template>
  </UContainer>
</template>
