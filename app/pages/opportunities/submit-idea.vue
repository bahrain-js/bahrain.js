<script setup lang="ts">
const { user, isAuthenticated, loading: authLoading, signInWithGitHub } = useAuth()
const client = useNeonClient()

const saving = ref(false)
const saved = ref(false)

const form = ref({
  title: '',
  problem: '',
  description: '',
  sector: '',
  looking_for: 'Technical Co-founder',
  contact_url: '',
  tags: []
})

const sectors = [
  { label: 'FinTech', value: 'FinTech' },
  { label: 'EdTech', value: 'EdTech' },
  { label: 'HealthTech', value: 'HealthTech' },
  { label: 'E-commerce', value: 'E-commerce' },
  { label: 'Logistics', value: 'Logistics' },
  { label: 'SaaS', value: 'SaaS' },
  { label: 'AI / ML', value: 'AI / ML' },
  { label: 'Developer Tools', value: 'Developer Tools' },
  { label: 'Social', value: 'Social' },
  { label: 'Other', value: 'Other' }
]

const lookingForOptions = ref([
  'Technical Co-founder',
  'Full-stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'Designer',
  'Any Builder'
])

function onCreateLookingFor(item: string) {
  lookingForOptions.value.push(item)
  form.value.looking_for = item
}

async function submitIdea() {
  if (!user.value || !form.value.title || !form.value.problem || !form.value.contact_url) return

  saving.value = true
  try {
    const { error } = await client
      .from('startup_ideas')
      .insert({
        title: form.value.title,
        problem: form.value.problem,
        description: form.value.description || null,
        sector: form.value.sector || null,
        looking_for: form.value.looking_for,
        contact_url: form.value.contact_url,
        tags: form.value.tags,
        status: 'pending',
        submitted_by: user.value.id
      })

    if (error) throw error
    saved.value = true
  } catch (err) {
    console.error('Failed to submit idea:', err)
    useToast().add({ title: 'Failed to submit startup idea', description: 'Please try again.', color: 'error', icon: 'i-lucide-circle-x' })
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: 'Share a Startup Idea — Bahrain.js',
  description: 'Share a startup idea with the Bahrain.js community and find co-founders or team members.'
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
      Share a Startup Idea
    </h1>
    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 mb-8">
      Looking for a technical co-founder or team member? Share your Bahrain-focused startup idea.
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
          Sign in to submit an idea
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          You need a GitHub account to share startup ideas with the community.
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
          Idea Submitted!
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400">
          Your startup idea has been submitted for review. The core team will approve it shortly.
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
      <UForm
        class="space-y-6"
        @submit.prevent="submitIdea"
      >
        <UFormField
          label="Idea Title"
          required
        >
          <UInput
            v-model="form.title"
            placeholder="e.g. Local Delivery Platform for Bahrain"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Problem It Solves"
          required
        >
          <UTextarea
            v-model="form.problem"
            placeholder="What pain point does this address? Why does Bahrain need this?"
            required
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="form.description"
            placeholder="Broader vision, target market, how it would work"
            :rows="4"
            class="w-full"
          />
        </UFormField>

        <div class="grid sm:grid-cols-2 gap-4">
          <UFormField label="Sector">
            <USelect
              v-model="form.sector"
              :items="sectors"
              placeholder="Select a sector"
              :ui="{ content: 'min-w-fit' }"
            />
          </UFormField>

          <UFormField
            label="Looking For"
            required
          >
            <USelectMenu
              v-model="form.looking_for"
              :items="lookingForOptions"
              create-item
              placeholder="Select or type a new role"
              class="w-full"
              @create="onCreateLookingFor"
            />
          </UFormField>
        </div>

        <UFormField
          label="Contact URL"
          required
        >
          <UInput
            v-model="form.contact_url"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile or email"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Tags">
          <UInputTags
            v-model="form.tags"
            placeholder="Enter tags"
            :add-on-tab="true"
            :add-on-blur="true"
            class="w-full"
          />
          <template #hint>
            Enter tags separated by commas
          </template>
        </UFormField>

        <div class="flex items-center gap-4">
          <UButton
            type="submit"
            label="Submit for Review"
            icon="i-lucide-send"
            :loading="saving"
            :disabled="!form.title || !form.problem || !form.contact_url"
          />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Ideas are published after core team approval.
          </p>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>
