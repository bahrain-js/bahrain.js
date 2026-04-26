<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error.statusCode === 404)

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <UApp>
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center max-w-md">
        <!-- Error code -->
        <p class="text-8xl font-extrabold text-primary mb-4">
          {{ error.statusCode }}
        </p>

        <!-- Heading -->
        <h1 class="text-2xl font-bold text-highlighted mb-2">
          {{ is404 ? 'Page not found' : 'Something went wrong' }}
        </h1>

        <!-- Description -->
        <p class="text-muted mb-8">
          {{
            is404
              ? "The page you're looking for doesn't exist or has been moved."
              : error.message || 'An unexpected error occurred. Please try again.'
          }}
        </p>

        <!-- Actions -->
        <div class="flex items-center justify-center gap-3">
          <UButton
            label="Go home"
            icon="i-lucide-home"
            size="lg"
            @click="handleError"
          />
          <UButton
            v-if="!is404"
            label="Try again"
            icon="i-lucide-refresh-cw"
            variant="outline"
            color="neutral"
            size="lg"
            @click="clearError()"
          />
        </div>

        <!-- Community links -->
        <p class="text-sm text-muted mt-12">
          Need help?
          <NuxtLink
            to="https://discord.gg/EZrDeaErBV"
            target="_blank"
            class="text-primary hover:underline"
          >
            Join our Discord
          </NuxtLink>
        </p>
      </div>
    </div>
  </UApp>
</template>
