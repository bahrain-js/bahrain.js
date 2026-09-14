<script setup lang="ts">
const pipeline = [
  { icon: 'i-lucide-lightbulb', title: 'Idea', description: 'Pitched at a meetup or on Discord' },
  { icon: 'i-lucide-hammer', title: 'Build', description: 'Built at a builder session' },
  { icon: 'i-lucide-flask-conical', title: 'Prototype', description: 'Working proof of concept' },
  { icon: 'i-lucide-git-branch', title: 'Repo', description: 'Published under bahrain-js on GitHub' },
  { icon: 'i-lucide-package', title: 'Publish', description: 'Live on npm as @bahrain.js/*' }
]

const pipelineRef = ref<HTMLElement>()
useScrollReveal(pipelineRef, ['.section-header', '.pipeline-step', '.pipeline-arrow'])
</script>

<template>
  <section ref="pipelineRef" class="py-12 sm:py-16 md:py-20 bg-elevated relative z-10 overflow-hidden">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="section-header text-center mb-10 sm:mb-14">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          From idea to npm package
        </h2>
        <p class="mt-3 sm:mt-4 text-base sm:text-lg text-muted max-w-2xl mx-auto px-4 sm:px-0">
          Bahrain.js isn't just meetups — it's a launchpad for open source.
        </p>
      </div>

      <!-- Grid layout with connected arrows -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 relative">
        <!-- Background track line for desktop -->
        <div
          class="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2" />

        <!-- Arrow overlays for desktop -->
        <div v-for="i in pipeline.length - 1" :key="`arrow-${i}`"
          class="hidden lg:flex absolute top-1/2 -translate-y-1/2 items-center justify-center"
          :style="{ left: `${(i / pipeline.length) * 100 + 10}%`, transform: 'translate(-50%, -50%)' }">
          <UIcon name="i-lucide-arrow-right" class="size-5 text-primary bg-default rounded-full p-0.5 z-10" />
        </div>

        <!-- Grid items -->
        <div v-for="(step, i) in pipeline" :key="step.title"
          class="pipeline-step flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-default border border-transparent hover:border-primary/30 transition-all hover:shadow-lg hover:scale-101 relative z-10">
          <!-- Step number badge -->
          <div
            class="absolute -top-2 -left-2 w-6 h-6 text-white dark:text-black rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {{ i + 1 }}
          </div>

          <!-- Icon -->
          <div
            class="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20 shrink-0">
            <UIcon :name="step.icon" class="size-6 text-primary" />
          </div>

          <!-- Content -->
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-semibold">
              {{ step.title }}
            </h3>
            <p class="text-xs sm:text-sm text-muted leading-relaxed max-w-[200px] mx-auto">
              {{ step.description }}
            </p>
          </div>

          <!-- Mobile arrow (shown between grid items) -->
          <div v-if="i < pipeline.length - 1" class="lg:hidden w-full flex justify-center -mb-2 -mt-2">
            <UIcon name="i-lucide-arrow-down" class="size-5 text-primary sm:hidden" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Ensure consistent card heights in grid */
.pipeline-step {
  min-height: 220px;
  height: 100%;
}

/* Mobile arrow spacing */
@media (max-width: 1023px) {
  .pipeline-step {
    min-height: 200px;
  }
}

@media (max-width: 640px) {
  .pipeline-step {
    min-height: 180px;
    padding: 1.25rem;
  }
}
</style>