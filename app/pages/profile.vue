<script setup lang="ts">
const { user, isAuthenticated, loading: authLoading, signInWithGitHub } = useAuth()
const client = useNeonClient()

const saving = ref(false)
const loadingProfile = ref(true)
const successMessage = ref('')
const hasExistingProfile = ref(false)

const form = reactive({
  display_name: '',
  github_username: '',
  avatar_url: '',
  bio: '',
  skills: [] as string[],
  currently_building: '',
  favorite_frameworks: [] as string[]
})

const newFramework = ref('')
const newSkill = ref('')

// Redirect if not authenticated
watch(
  () => authLoading.value,
  (isLoading) => {
    if (!isLoading && !isAuthenticated.value) {
      navigateTo('/people')
    }
  },
  { immediate: true }
)

// Fetch GitHub username by resolving the numeric ID from the avatar URL
async function fetchGitHubUsername(): Promise<string> {
  const u = user.value
  if (!u) return ''

  // Better Auth stores the GitHub avatar as: https://avatars.githubusercontent.com/u/{numeric_id}
  const avatarMatch = u.image?.match(/avatars\.githubusercontent\.com\/u\/(\d+)/)

  if (avatarMatch?.[1]) {
    try {
      const res = await fetch(`https://api.github.com/user/${avatarMatch[1]}`)
      if (res.ok) {
        const ghUser = await res.json()
        if (ghUser.login) return ghUser.login
      }
    } catch (err) {
      console.warn('GitHub API call failed:', err)
    }
  }

  // Fallback: check user object
  if (u.username) return u.username

  return ''
}

// Pre-populate from GitHub user data and load existing profile
watch(
  () => user.value,
  async (u) => {
    if (!u) return

    // Pre-fill from GitHub data
    form.display_name = u.name || u.email?.split('@')[0] || ''
    form.avatar_url = u.image || ''

    // Fetch GitHub username from OAuth account data
    const ghUsername = await fetchGitHubUsername()
    if (ghUsername) form.github_username = ghUsername

    // Check for existing profile in members table
    try {
      const { data } = await client
        .from('members')
        .select('*')
        .eq('user_id', u.id)
        .limit(1)

      if (data?.length) {
        hasExistingProfile.value = true
        const profile = data[0]
        form.display_name = profile.display_name
        form.github_username = profile.github_username
        form.avatar_url = profile.avatar_url || form.avatar_url
        form.bio = profile.bio || ''
        form.skills = profile.skills || []
        form.currently_building = profile.currently_building || ''
        form.favorite_frameworks = profile.favorite_frameworks || []
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      loadingProfile.value = false
    }
  },
  { immediate: true }
)

function addSkill() {
  const skill = newSkill.value.trim()
  if (skill && !form.skills.includes(skill)) {
    form.skills.push(skill)
  }
  newSkill.value = ''
}

function addFramework() {
  const fw = newFramework.value.trim()
  if (fw && !form.favorite_frameworks.includes(fw)) {
    form.favorite_frameworks.push(fw)
  }
  newFramework.value = ''
}

function removeFramework(fw: string) {
  form.favorite_frameworks = form.favorite_frameworks.filter(f => f !== fw)
}

function removeSkill(skill: string) {
  form.skills = form.skills.filter(s => s !== skill)
}

async function saveProfile() {
  if (!user.value) return
  saving.value = true
  successMessage.value = ''

  try {
    if (hasExistingProfile.value) {
      const { error } = await client
        .from('members')
        .update({
          display_name: form.display_name,
          avatar_url: form.avatar_url,
          bio: form.bio,
          skills: form.skills,
          currently_building: form.currently_building,
          favorite_frameworks: form.favorite_frameworks,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.value.id)

      if (error) throw error
    } else {
      const { error } = await client
        .from('members')
        .insert({
          user_id: user.value.id,
          display_name: form.display_name,
          github_username: form.github_username,
          avatar_url: form.avatar_url,
          bio: form.bio,
          skills: form.skills,
          currently_building: form.currently_building,
          favorite_frameworks: form.favorite_frameworks
        })

      if (error) throw error
      hasExistingProfile.value = true
    }

    successMessage.value = 'Profile saved!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err: unknown) {
    console.error('Failed to save profile:', err)
    alert('Failed to save profile. Please try again.')
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: 'Your Profile — Bahrain.js',
  description: 'Edit your Bahrain.js community profile.'
})
</script>

<template>
  <UContainer class="py-16 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Your Profile
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
        Edit your community profile. It's visible on the People page.
      </p>
    </div>

    <div class="max-w-3xl mx-auto">
      <!-- Not authenticated -->
      <UCard
        v-if="!authLoading && !isAuthenticated"
        class="text-center"
      >
        <div class="space-y-4">
          <UIcon
            name="i-lucide-lock"
            class="text-4xl text-muted"
          />
          <h2 class="text-lg font-semibold">
            Sign in to edit your profile
          </h2>
          <p class="text-muted">
            You need a GitHub account to join the community.
          </p>
          <UButton
            icon="i-simple-icons-github"
            label="Sign in with GitHub"
            color="primary"
            size="lg"
            @click="signInWithGitHub"
          />
        </div>
      </UCard>

      <!-- Loading -->
      <div
        v-else-if="authLoading || loadingProfile"
        class="space-y-6"
      >
        <USkeleton class="h-12 w-full rounded-lg" />
        <USkeleton class="h-12 w-full rounded-lg" />
        <USkeleton class="h-32 w-full rounded-lg" />
      </div>

      <!-- Profile form -->
      <UCard v-else>
        <UForm
          :state="form"
          class="space-y-6 w-full [&>div]:w-full"
          @submit="saveProfile"
        >
          <!-- Avatar preview -->
          <div class="flex items-center gap-4">
            <UAvatar
              :src="form.avatar_url"
              :alt="form.display_name"
              size="xl"
            />
            <div>
              <p class="font-semibold">
                {{ form.display_name || 'Your Name' }}
              </p>
              <p
                v-if="form.github_username"
                class="text-sm text-muted"
              >
                @{{ form.github_username }}
              </p>
              <p class="text-xs text-muted">
                Avatar from GitHub
              </p>
            </div>
          </div>

          <!-- Display Name -->
          <UFormField
            label="Display Name"
            name="display_name"
            required
            class="w-full"
          >
            <UInput
              v-model="form.display_name"
              placeholder="Your name"
              required
              class="w-full"
            />
          </UFormField>

          <!-- GitHub Username (read-only when profile exists) -->
          <UFormField
            label="GitHub Username"
            name="github_username"
            required
            class="w-full"
          >
            <UInput
              v-model="form.github_username"
              placeholder="your-username"
              icon="i-simple-icons-github"
              :readonly="hasExistingProfile"
              required
              class="w-full"
            />
            <template #hint>
              <span class="text-xs text-muted">Pulled from your GitHub account</span>
            </template>
          </UFormField>

          <!-- Bio -->
          <UFormField
            label="Bio"
            name="bio"
            class="w-full"
          >
            <UTextarea
              v-model="form.bio"
              placeholder="Tell the community about yourself..."
              :rows="3"
              class="w-full"
            />
          </UFormField>

          <!-- Skills -->
          <UFormField
            label="Skills"
            name="skills"
          >
            <div class="space-y-2">
              <div class="flex gap-2">
                <UInput
                  v-model="newSkill"
                  placeholder="Add a skill (e.g. Vue, TypeScript)"
                  class="flex-1"
                  @keydown.enter.prevent="addSkill"
                />
                <UButton
                  type="button"
                  icon="i-lucide-plus"
                  variant="outline"
                  @click="addSkill"
                />
              </div>
              <div
                v-if="form.skills.length"
                class="flex flex-wrap gap-1.5"
              >
                <UBadge
                  v-for="skill in form.skills"
                  :key="skill"
                  color="neutral"
                  variant="outline"
                  class="cursor-pointer"
                  @click="removeSkill(skill)"
                >
                  {{ skill }}
                  <UIcon
                    name="i-lucide-x"
                    class="ml-1 w-3 h-3"
                  />
                </UBadge>
              </div>
            </div>
          </UFormField>

          <!-- Favorite Frameworks -->
          <UFormField label="Favorite Frameworks">
            <div class="space-y-2">
              <div class="flex gap-2">
                <UInput
                  v-model="newFramework"
                  placeholder="Add a framework (e.g. Vue, React, Nuxt)"
                  class="flex-1"
                  @keydown.enter.prevent="addFramework"
                />
                <UButton
                  type="button"
                  icon="i-lucide-plus"
                  variant="outline"
                  @click="addFramework"
                />
              </div>
              <div
                v-if="form.favorite_frameworks.length"
                class="flex flex-wrap gap-1.5"
              >
                <UBadge
                  v-for="fw in form.favorite_frameworks"
                  :key="fw"
                  color="primary"
                  variant="subtle"
                  class="cursor-pointer"
                  @click="removeFramework(fw)"
                >
                  {{ fw }}
                  <UIcon
                    name="i-lucide-x"
                    class="ml-1 w-3 h-3"
                  />
                </UBadge>
              </div>
            </div>
          </UFormField>

          <!-- Currently Building -->
          <UFormField label="Currently Building">
            <UInput
              v-model="form.currently_building"
              placeholder="What are you working on?"
              class="w-full"
            />
          </UFormField>

          <!-- Submit -->
          <div class="flex items-center gap-4">
            <UButton
              type="submit"
              label="Save Profile"
              icon="i-lucide-save"
              color="primary"
              :loading="saving"
              size="lg"
            />
            <NuxtLink
              to="/people"
              class="text-sm text-muted hover:text-default transition-colors"
            >
              ← Back to People
            </NuxtLink>
            <p
              v-if="successMessage"
              class="text-sm text-green-500 flex items-center gap-1"
            >
              <UIcon name="i-lucide-check" />
              {{ successMessage }}
            </p>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>
