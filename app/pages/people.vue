<script setup lang="ts">
const { user, isAuthenticated, loading: authLoading, signInWithGitHub } = useAuth()
const client = useNeonClient()

const searchQuery = ref('')
const selectedSkill = ref('all')
const members = ref<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
const loading = ref(true)

const roleBadgeColor = {
  core: 'primary' as const,
  maintainer: 'success' as const,
  contributor: 'info' as const,
  member: 'neutral' as const
}

const roleBadgeLabel = {
  core: 'Core Team',
  maintainer: 'Maintainer',
  contributor: 'Contributor',
  member: 'Member'
} as Record<string, string>

const skillColors = [
  'text-yellow-600 bg-yellow-50 ring-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:ring-yellow-800',
  'text-sky-600 bg-sky-50 ring-sky-200 dark:text-sky-400 dark:bg-sky-900/30 dark:ring-sky-800',
  'text-emerald-600 bg-emerald-50 ring-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:ring-emerald-800',
  'text-violet-600 bg-violet-50 ring-violet-200 dark:text-violet-400 dark:bg-violet-900/30 dark:ring-violet-800',
  'text-rose-600 bg-rose-50 ring-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:ring-rose-800',
  'text-amber-600 bg-amber-50 ring-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:ring-amber-800'
]

function getSkillColor(skill: string): string {
  let hash = 0
  for (let i = 0; i < skill.length; i++) {
    hash = skill.charCodeAt(i) + ((hash << 5) - hash)
  }
  return skillColors[Math.abs(hash) % skillColors.length]!
}

// Fetch all members
async function fetchMembers() {
  loading.value = true
  try {
    const { data, error } = await client
      .from('members')
      .select('*')
      .order('role', { ascending: true })
      .order('display_name', { ascending: true })

    if (error) throw error
    members.value = data || []
  } catch (err) {
    console.error('Failed to load members:', err)
    members.value = []
  } finally {
    loading.value = false
  }
}

// Computed: all unique skills across members
const allSkills = computed(() => {
  const skills = new Set<string>()
  members.value.forEach((m: any) => {
    if (m.skills) m.skills.forEach((s: string) => skills.add(s))
  })
  return Array.from(skills).sort()
})

// Computed: filtered members
const filteredMembers = computed(() => {
  return members.value.filter((m: any) => {
    const matchesSearch = !searchQuery.value
      || m.display_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || m.github_username.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesSkill = selectedSkill.value === 'all'
      || (m.skills && m.skills.includes(selectedSkill.value))

    return matchesSearch && matchesSkill
  })
})

// Computed: core team (top section)
const coreTeam = computed(() => filteredMembers.value.filter((m: any) => m.role === 'core'))
const communityMembers = computed(() => filteredMembers.value.filter((m: any) => m.role !== 'core'))

// Check if current user has a profile
const currentUserProfile = computed(() => {
  if (!user.value) return null
  return members.value.find((m: any) => m.user_id === user.value.id)
})

onMounted(() => {
  fetchMembers()
})

useSeoMeta({
  title: 'People — Bahrain.js',
  description: 'Meet the Bahrain.js community — developers, maintainers, and builders shaping the JavaScript ecosystem in Bahrain.'
})
</script>

<template>
  <div>
    <UContainer class="py-12 space-y-10">
      <!-- Hero Header -->
      <div class="text-center max-w-2xl mx-auto">
        <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
          People
        </h1>
        <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
          The developers, maintainers, and builders behind Bahrain.js.
        </p>
      </div>

      <!-- Stats Bar -->
      <div
        v-if="!loading && members.length"
        class="flex items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400"
      >
        <div class="flex items-center gap-1.5">
          <UIcon
            name="i-lucide-users"
            class="text-primary-500"
          />
          <span><strong class="text-zinc-900 dark:text-white">{{ members.length }}</strong> {{ members.length === 1 ? 'member' : 'members' }}</span>
        </div>
        <span class="text-zinc-300 dark:text-zinc-600">·</span>
        <div class="flex items-center gap-1.5">
          <UIcon
            name="i-lucide-code-2"
            class="text-primary-500"
          />
          <span><strong class="text-zinc-900 dark:text-white">{{ allSkills.length }}</strong> {{ allSkills.length === 1 ? 'skill' : 'skills' }} represented</span>
        </div>
      </div>

      <!-- Profile Action -->
      <div
        v-if="!loading"
        class="flex justify-center"
      >
        <UButton
          v-if="isAuthenticated && !currentUserProfile"
          to="/profile"
          icon="i-lucide-user-plus"
          label="Create Profile"
          color="primary"
        />
        <UButton
          v-else-if="isAuthenticated && currentUserProfile"
          to="/profile"
          icon="i-lucide-pencil"
          label="Edit Profile"
          variant="outline"
        />
        <UButton
          v-else-if="!authLoading"
          icon="i-simple-icons-github"
          label="Sign in to Join"
          color="neutral"
          @click="signInWithGitHub"
        />
      </div>

      <!-- Search & Filter Bar -->
      <div class="flex gap-3 w-full">
        <UInput
          v-model="searchQuery"
          placeholder="Search by name or username..."
          icon="i-lucide-search"
          class="flex-1"
        />
        <USelect
          v-if="allSkills.length"
          v-model="selectedSkill"
          :items="[{ label: 'All skills', value: 'all' }, ...allSkills.map(s => ({ label: s, value: s }))]"
          placeholder="Filter by skill"
          class="w-full sm:w-48"
        />
      </div>

      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <USkeleton
          v-for="i in 6"
          :key="i"
          class="h-56 rounded-xl"
        />
      </div>

      <!-- Empty state -->
      <UEmpty
        v-else-if="!members.length"
        icon="i-lucide-users"
        title="No members yet"
        description="Be the first to join! Sign in with GitHub to create your profile."
      >
        <template #actions>
          <UButton
            v-if="!isAuthenticated"
            icon="i-simple-icons-github"
            label="Sign in with GitHub"
            color="primary"
            @click="signInWithGitHub"
          />
        </template>
      </UEmpty>

      <template v-else>
        <!-- Core Team Spotlight -->
        <section v-if="coreTeam.length">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <UIcon
              name="i-lucide-crown"
              class="text-yellow-500"
            />
            Core Team
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="member in coreTeam"
              :key="member.id"
              class="group relative rounded-2xl border-2 border-yellow-200 dark:border-yellow-800/50 bg-gradient-to-br from-yellow-50/50 to-white dark:from-yellow-900/10 dark:to-zinc-900 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-0.5"
            >
              <!-- Gold accent line -->
              <div class="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

              <div class="flex items-start gap-5">
                <a
                  :href="`https://github.com/${member.github_username}`"
                  target="_blank"
                  class="shrink-0"
                >
                  <UAvatar
                    :src="member.avatar_url"
                    :alt="member.display_name"
                    size="3xl"
                    class="ring-2 ring-yellow-300 dark:ring-yellow-700 group-hover:ring-yellow-400 transition-all"
                  />
                </a>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-lg font-bold">
                      {{ member.display_name }}
                    </h3>
                    <UBadge
                      color="primary"
                      variant="subtle"
                      size="xs"
                    >
                      {{ roleBadgeLabel[member.role] }}
                    </UBadge>
                  </div>

                  <!-- Social links row -->
                  <div class="flex items-center gap-3 mt-1">
                    <a
                      :href="`https://github.com/${member.github_username}`"
                      target="_blank"
                      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <UIcon
                        name="i-simple-icons-github"
                        class="size-3.5"
                      />
                      {{ member.github_username }}
                    </a>
                    <a
                      v-if="member.website_url"
                      :href="member.website_url"
                      target="_blank"
                      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <UIcon
                        name="i-lucide-globe"
                        class="size-3.5"
                      />
                      Website
                    </a>
                    <a
                      v-if="member.twitter_handle"
                      :href="`https://x.com/${member.twitter_handle}`"
                      target="_blank"
                      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <UIcon
                        name="i-simple-icons-x"
                        class="size-3.5"
                      />
                      {{ member.twitter_handle }}
                    </a>
                  </div>

                  <p
                    v-if="member.bio"
                    class="text-sm text-zinc-600 dark:text-zinc-400 mt-3 line-clamp-3"
                  >
                    {{ member.bio }}
                  </p>

                  <!-- Currently building -->
                  <div
                    v-if="member.currently_building"
                    class="mt-3 flex items-center gap-1.5 text-sm"
                  >
                    <UIcon
                      name="i-lucide-rocket"
                      class="text-yellow-500 size-4"
                    />
                    <span class="text-zinc-500 dark:text-zinc-400">Building</span>
                    <span class="font-medium">{{ member.currently_building }}</span>
                  </div>
                </div>
              </div>

              <!-- Skills -->
              <div
                v-if="member.skills?.length"
                class="mt-5 flex flex-wrap gap-1.5"
              >
                <span
                  v-for="skill in member.skills"
                  :key="skill"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1"
                  :class="getSkillColor(skill)"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Community Members -->
        <section v-if="communityMembers.length">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <UIcon name="i-lucide-users" />
            Community Members
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="member in communityMembers"
              :key="member.id"
              class="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all duration-300 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-0.5"
            >
              <div class="flex items-start gap-4">
                <a
                  :href="`https://github.com/${member.github_username}`"
                  target="_blank"
                  class="shrink-0"
                >
                  <UAvatar
                    :src="member.avatar_url"
                    :alt="member.display_name"
                    size="xl"
                    class="ring-1 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-primary-300 dark:group-hover:ring-primary-700 transition-all"
                  />
                </a>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold truncate">
                      {{ member.display_name }}
                    </h3>
                    <UBadge
                      :color="(roleBadgeColor as any)[member.role]"
                      variant="subtle"
                      size="xs"
                    >
                      {{ roleBadgeLabel[member.role] }}
                    </UBadge>
                  </div>

                  <!-- Social links -->
                  <div class="flex items-center gap-2.5 mt-1">
                    <a
                      :href="`https://github.com/${member.github_username}`"
                      target="_blank"
                      class="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <UIcon
                        name="i-simple-icons-github"
                        class="size-3"
                      />
                      {{ member.github_username }}
                    </a>
                    <a
                      v-if="member.website_url"
                      :href="member.website_url"
                      target="_blank"
                      class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    >
                      <UIcon
                        name="i-lucide-globe"
                        class="size-3.5"
                      />
                    </a>
                  </div>

                  <p
                    v-if="member.bio"
                    class="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2"
                  >
                    {{ member.bio }}
                  </p>
                </div>
              </div>

              <!-- Currently building -->
              <div
                v-if="member.currently_building"
                class="mt-3 flex items-center gap-1.5 text-sm"
              >
                <UIcon
                  name="i-lucide-rocket"
                  class="text-primary-500 size-3.5"
                />
                <span class="text-zinc-500 dark:text-zinc-400">Building</span>
                <span class="font-medium truncate">{{ member.currently_building }}</span>
              </div>

              <!-- Skills -->
              <div
                v-if="member.skills?.length"
                class="mt-3 flex flex-wrap gap-1.5"
              >
                <span
                  v-for="skill in member.skills"
                  :key="skill"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1"
                  :class="getSkillColor(skill)"
                >
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- No results -->
        <UEmpty
          v-if="!filteredMembers.length && members.length"
          icon="i-lucide-search-x"
          title="No matches"
          description="No members match your search. Try a different query."
        />
      </template>

      <!-- Join the Community CTA  -->
      <section class="mt-12">
        <div class="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-yellow-50/80 via-white to-primary-50/50 dark:from-yellow-900/10 dark:via-zinc-900 dark:to-primary-900/10 p-8 sm:p-10 text-center">
          <!-- Background decorations -->
          <div class="absolute -top-12 -right-12 size-48 rounded-full bg-yellow-200/30 dark:bg-yellow-800/10 blur-3xl" />
          <div class="absolute -bottom-12 -left-12 size-48 rounded-full bg-primary-200/30 dark:bg-primary-800/10 blur-3xl" />

          <div class="relative">
            <h2 class="text-2xl font-bold">
              Join the roster
            </h2>
            <p class="mt-2 text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Sign in with GitHub, create your developer profile, and connect with Bahrain's JS community.
            </p>

            <div class="mt-6 flex items-center justify-center gap-3">
              <UButton
                v-if="!isAuthenticated && !authLoading"
                icon="i-simple-icons-github"
                label="Sign in with GitHub"
                color="primary"
                size="lg"
                @click="signInWithGitHub"
              />
              <UButton
                v-else-if="isAuthenticated && !currentUserProfile"
                to="/profile"
                icon="i-lucide-user-plus"
                label="Create Your Profile"
                color="primary"
                size="lg"
              />
              <UButton
                v-else-if="isAuthenticated && currentUserProfile"
                to="/profile"
                icon="i-lucide-pencil"
                label="Edit Your Profile"
                variant="outline"
                size="lg"
              />
            </div>

            <!-- Tier legend -->
            <div class="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-zinc-400" />
                <span>Member</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-sky-500" />
                <span>Contributor</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-emerald-500" />
                <span>Maintainer</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full bg-yellow-500" />
                <span>Core Team</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </UContainer>
  </div>
</template>
