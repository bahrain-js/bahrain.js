<script setup lang="ts">
const { user, isAuthenticated, loading: authLoading, signInWithGitHub } = useAuth()
const client = useNeonClient()

const saving = ref(false)
const saved = ref(false)

const form = ref({
  title: '',
  company: '',
  description: '',
  location: '',
  salary_range: '',
  is_remote: false,
  url: '',
  tags: ''
})

async function submitJob() {
  if (!user.value || !form.value.title || !form.value.company || !form.value.url) return

  saving.value = true
  try {
    const tags = form.value.tags
      ? form.value.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : []

    const { error } = await client
      .from('opportunities')
      .insert({
        title: form.value.title,
        company: form.value.company,
        description: form.value.description,
        location: form.value.location || null,
        salary_range: form.value.salary_range || null,
        is_remote: form.value.is_remote,
        url: form.value.url,
        tags,
        status: 'pending',
        submitted_by: user.value.id
      })

    if (error) throw error
    saved.value = true
  } catch (err) {
    console.error('Failed to submit job:', err)
    alert('Failed to submit job listing. Please try again.')
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: 'Submit Job — Bahrain.js',
  description: 'Submit a JavaScript or web development job listing for the Bahrain.js community.'
})
</script>

<template>
  <UContainer class="py-16 max-w-2xl mx-auto">
    <NuxtLink
      to="/opportunities"
      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-yellow-500 transition-colors mb-8"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      Back to opportunities
    </NuxtLink>

    <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
      Submit a Job
    </h1>
    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 mb-8">
      Post a JavaScript or web development position. Listings are published after core team review.
    </p>

    <!-- Auth required -->
    <UCard
      v-if="!authLoading && !isAuthenticated"
      class="text-center"
    >
      <div class="space-y-4 py-8">
        <UIcon
          name="i-lucide-lock"
          class="size-12 text-zinc-400 mx-auto"
        />
        <h2 class="text-xl font-semibold">
          Sign in to submit a job
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          You need a GitHub account to post job listings for the community.
        </p>
        <UButton
          icon="i-simple-icons-github"
          label="Sign in with GitHub"
          color="neutral"
          size="lg"
          @click="signInWithGitHub"
        />
      </div>
    </UCard>

    <!-- Success state -->
    <UCard
      v-else-if="saved"
      class="text-center"
    >
      <div class="space-y-4 py-8">
        <UIcon
          name="i-lucide-check-circle"
          class="size-16 text-green-500 mx-auto"
        />
        <h2 class="text-xl font-semibold">
          Job Submitted!
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400">
          Your listing has been submitted for review. The core team will approve it shortly.
        </p>
        <UButton
          to="/opportunities"
          label="Back to Opportunities"
          icon="i-lucide-arrow-left"
          variant="outline"
        />
      </div>
    </UCard>

    <!-- Form -->
    <UCard v-else>
      <form
        class="space-y-6"
        @submit.prevent="submitJob"
      >
        <UFormField
          label="Job Title"
          required
        >
          <UInput
            v-model="form.title"
            placeholder="e.g. Senior Frontend Developer"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Company"
          required
        >
          <UInput
            v-model="form.company"
            placeholder="e.g. Tamkeen"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Description"
          required
        >
          <UTextarea
            v-model="form.description"
            placeholder="Describe the role, responsibilities, and requirements"
            required
            :rows="5"
            class="w-full"
          />
        </UFormField>

        <div class="grid sm:grid-cols-2 gap-4">
          <UFormField label="Location">
            <UInput
              v-model="form.location"
              placeholder="e.g. Manama, Bahrain"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Salary Range">
            <UInput
              v-model="form.salary_range"
              placeholder="e.g. 800–1200 BHD"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField>
          <div class="flex items-center gap-3">
            <USwitch v-model="form.is_remote" />
            <span class="text-sm">This position is remote-friendly</span>
          </div>
        </UFormField>

        <UFormField
          label="Application URL"
          required
        >
          <UInput
            v-model="form.url"
            type="url"
            placeholder="https://careers.example.com/apply"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tags">
          <UInput
            v-model="form.tags"
            placeholder="e.g. Vue, TypeScript, Node (comma-separated)"
            class="w-full"
          />
          <template #hint>
            Comma-separated skills or technologies
          </template>
        </UFormField>

        <div class="flex items-center gap-4">
          <UButton
            type="submit"
            label="Submit for Review"
            icon="i-lucide-send"
            :loading="saving"
            :disabled="!form.title || !form.company || !form.url"
          />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Listings are published after core team approval.
          </p>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>
