<script setup lang="ts">
const config = useRuntimeConfig()

const email = ref('')
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function subscribe() {
  if (!email.value) return

  submitting.value = true
  error.value = ''

  try {
    const apiUrl = config.public.neonDataApiUrl
    const res = await fetch(`${apiUrl}/newsletter_subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ email: email.value })
    })

    if (res.ok) {
      submitted.value = true
    } else {
      const data = await res.json().catch(() => null)
      if (data?.code === '23505') {
        error.value = 'You\'re already subscribed!'
      } else {
        throw new Error(data?.message || 'Failed to subscribe')
      }
    }
  } catch (err) {
    console.error('Newsletter signup failed:', err)
    error.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 px-6 py-10 sm:px-10 sm:py-12 text-center">
    <UIcon
      name="i-lucide-mail"
      class="size-10 text-primary mx-auto mb-4"
    />
    <h3 class="text-2xl font-bold">
      Stay in the loop
    </h3>
    <p class="mt-2 text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
      Get notified about upcoming events, new projects, and community updates. No spam, ever.
    </p>

    <!-- Success state -->
    <div
      v-if="submitted"
      class="mt-6 flex items-center justify-center gap-2 text-green-600 dark:text-green-400"
    >
      <UIcon
        name="i-lucide-check-circle"
        class="size-5"
      />
      <span class="font-medium">You're subscribed! 🎉</span>
    </div>

    <!-- Form -->
    <form
      v-else
      class="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
      @submit.prevent="subscribe"
    >
      <UInput
        v-model="email"
        type="email"
        placeholder="you@example.com"
        required
        class="w-full sm:flex-1"
        size="lg"
      />
      <UButton
        type="submit"
        label="Subscribe"
        icon="i-lucide-arrow-right"
        size="lg"
        :loading="submitting"
        :disabled="!email"
        class="w-full sm:w-auto"
      />
    </form>

    <p
      v-if="error"
      class="mt-3 text-sm text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
