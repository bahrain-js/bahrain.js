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
  <section
    ref="pipelineRef"
    class="py-20 bg-elevated relative z-10"
  >
    <div class="mx-auto max-w-5xl px-6">
      <div class="section-header text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          From idea to npm package
        </h2>
        <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Bahrain.js isn't just meetups — it's a launchpad for open source.
        </p>
      </div>

      <!-- Pipeline track -->
      <div class="pipeline-track relative">
        <!-- Background track line -->
        <div class="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 mx-16" />

        <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 relative">
          <div
            v-for="(step, i) in pipeline"
            :key="step.title"
            class="flex items-center gap-2 sm:gap-0"
          >
            <div
              class="pipeline-step flex flex-col items-center text-center gap-2 px-4 py-4 rounded-xl bg-default min-w-[110px] relative z-10 border border-transparent hover:border-primary/30 transition-colors"
            >
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <UIcon
                  :name="step.icon"
                  class="size-5 text-primary"
                />
              </div>
              <p class="text-sm font-semibold">
                {{ step.title }}
              </p>
              <p class="text-xs text-muted">
                {{ step.description }}
              </p>
            </div>
            <UIcon
              v-if="i < pipeline.length - 1"
              name="i-lucide-arrow-right"
              class="pipeline-arrow size-5 text-primary hidden sm:block mx-2"
            />
            <UIcon
              v-if="i < pipeline.length - 1"
              name="i-lucide-arrow-down"
              class="pipeline-arrow size-5 text-primary sm:hidden"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
