<script setup lang="ts">
const tiers = [
  { icon: 'i-lucide-user', title: 'Member', description: 'Show up, learn, and connect', how: 'Create your profile' },
  { icon: 'i-lucide-git-pull-request', title: 'Contributor', description: 'Ship a PR, give a talk, or write a post', how: 'Your first merged contribution' },
  { icon: 'i-lucide-shield', title: 'Maintainer', description: 'Own and steward a @bahrain.js project', how: 'Sustained contributions over time' },
  { icon: 'i-lucide-crown', title: 'Core Team', description: 'Shape the direction of the community', how: 'Recognized community leadership' }
]

const tiersRef = ref<HTMLElement>()
useScrollReveal(tiersRef, ['.section-header', '.tier-card'])
</script>

<template>
  <section
    ref="tiersRef"
    class="py-20"
  >
    <div class="mx-auto max-w-5xl px-6">
      <div class="section-header text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Your path forward
        </h2>
        <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
          A clear, transparent progression — no gatekeeping.
        </p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <UCard
          v-for="tier in tiers"
          :key="tier.title"
          class="tier-card"
        >
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <UIcon
                :name="tier.icon"
                class="size-5 text-primary"
              />
              <p class="font-semibold">
                {{ tier.title }}
              </p>
            </div>
            <p class="text-sm text-muted">
              {{ tier.description }}
            </p>
            <p class="text-xs text-muted italic mt-1">
              {{ tier.how }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>
