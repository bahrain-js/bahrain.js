<script setup lang="ts">
const tiers = [
  { icon: 'i-lucide-user', title: 'Member', description: 'Attending events and learning', how: 'Sign up and join the chat' },
  { icon: 'i-lucide-git-pull-request', title: 'Contributor', description: 'Merged PRs, talks, or posts', how: 'Submit a PR or give a talk' },
  { icon: 'i-lucide-shield', title: 'Maintainer', description: 'Stewards specific projects', how: 'Consistent contributions' },
  { icon: 'i-lucide-crown', title: 'Core Team', description: 'Stewards of the org', how: 'Sustained community impact' }
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
          Level up
        </h2>
        <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Transparent progression from attendee to maintainer.
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
