<template>
  <UFooter
    :ui="{
      container: 'py-8 sm:py-4 sm:flex sm:items-center sm:justify-between sm:gap-x-3',
      left: 'flex items-center justify-center sm:justify-start sm:flex-1 gap-x-1.5 mt-3 sm:mt-0 sm:order-1',
      center: 'mt-3 sm:mt-0 sm:order-2 flex items-center justify-center',
      right: 'sm:flex-1 flex items-center justify-center sm:justify-end gap-x-1.5 sm:order-3'
    }"
  >
    <template #top>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-4">
        <span class="text-xs text-muted uppercase tracking-wider font-medium">Part of the Bahrain tech ecosystem</span>
        <div class="flex items-center gap-4">
          <NuxtLink
            to="https://www.startupbahrain.com"
            target="_blank"
            class="text-sm text-muted hover:text-highlighted transition-colors flex items-center gap-1.5"
          >
            <UIcon
              name="i-lucide-rocket"
              class="size-4"
            />
            Startup Bahrain
          </NuxtLink>
          <span class="text-default/20">·</span>
          <NuxtLink
            to="https://www.tamkeen.bh"
            target="_blank"
            class="text-sm text-muted hover:text-highlighted transition-colors flex items-center gap-1.5"
          >
            <UIcon
              name="i-lucide-landmark"
              class="size-4"
            />
            Tamkeen
          </NuxtLink>
        </div>
      </div>
    </template>

    <template #left>
      <div class="flex items-center gap-3">
        <AppLogo />
        <p class="text-sm text-muted">
          Bahrain's JavaScript community — building in the open.
        </p>
      </div>
    </template>

    <UNavigationMenu :items="navItems" />

    <template #right>
      <div class="flex items-center gap-1">
        <UButton
          to="https://github.com/bahrain-js"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
          size="sm"
        />
        <UButton
          to="https://discord.gg/EZrDeaErBV"
          target="_blank"
          icon="i-simple-icons-discord"
          aria-label="Discord"
          color="neutral"
          variant="ghost"
          size="sm"
        />
        <UButton
          to="https://www.npmjs.com/org/bahrain.js"
          target="_blank"
          icon="i-simple-icons-npm"
          aria-label="npm"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </div>
    </template>
  </UFooter>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const navItems: NavigationMenuItem[] = [
  { label: 'Events', to: '/events' },
  { label: 'Projects', to: '/projects' },
  { label: 'Frameworks', to: '/frameworks' },
  { label: 'People', to: '/people' },
  { label: 'Opportunities', to: '/opportunities' }
]
</script>
