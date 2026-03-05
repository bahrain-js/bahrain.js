<script setup lang="ts">
const features = [
  { icon: 'i-lucide-radio', title: 'Signal Hub', description: 'Events, jobs, projects, and people — one feed for Bahrain\'s JS scene.' },
  { icon: 'i-lucide-hammer', title: 'Build Together', description: 'Collaborate on open source. Ship code under the @bahrain.js org.' },
  { icon: 'i-lucide-package', title: 'Idea → npm', description: 'Every idea has a clear path to becoming a published package.' },
  { icon: 'i-lucide-graduation-cap', title: 'Level Up', description: 'A transparent path from your first line of JS to project maintainer.' }
]

const featuresRef = ref<HTMLElement>()
useScrollReveal(featuresRef, ['.section-header', '.feature-card'])
</script>

<template>
  <section
    ref="featuresRef"
    class="py-20"
  >
    <div class="mx-auto max-w-5xl px-6">
      <div class="section-header text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          More than meetups
        </h2>
        <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Everything Bahrain's JS developers need — in one place.
        </p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
        >
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <UIcon
                :name="feature.icon"
                class="size-6 text-primary"
              />
            </div>
            <h3 class="font-semibold">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-muted">
              {{ feature.description }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
