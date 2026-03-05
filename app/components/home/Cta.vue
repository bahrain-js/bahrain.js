<script setup lang="ts">
const { isAuthenticated, signInWithGitHub } = useAuth()

const ctaRef = ref<HTMLElement>()
useScrollReveal(ctaRef, ['.cta-title', '.cta-desc', '.cta-btn'])
</script>

<template>
  <section
    ref="ctaRef"
    class="py-20 bg-elevated relative overflow-hidden"
  >
    <div class="mx-auto max-w-3xl px-6 text-center relative z-10">
      <h2 class="cta-title text-3xl sm:text-4xl font-extrabold tracking-tight">
        Ready to build?
      </h2>
      <p class="cta-desc mt-4 text-lg text-muted max-w-xl mx-auto">
        Whether you're writing your first function or shipping to production — there's a place for you here.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <UButton
          v-if="!isAuthenticated"
          label="Join the community"
          trailing-icon="i-lucide-arrow-right"
          size="xl"
          class="cta-btn"
          @click="signInWithGitHub"
        />
        <UButton
          to="/events"
          label="Browse Events"
          icon="i-lucide-calendar"
          size="xl"
          :variant="isAuthenticated ? 'solid' : 'outline'"
          :color="isAuthenticated ? 'primary' : 'neutral'"
          class="cta-btn"
        />
        <UButton
          to="https://discord.gg/EZrDeaErBV"
          target="_blank"
          label="Join Discord"
          icon="i-simple-icons-discord"
          color="neutral"
          variant="outline"
          size="xl"
          class="cta-btn"
        />
      </div>
    </div>
  </section>
</template>
