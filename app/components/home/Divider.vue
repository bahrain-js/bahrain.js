<script setup lang="ts">
defineProps<{
  path: string
  flip?: boolean
}>()

const el = ref<HTMLElement>()

defineExpose({ el })
</script>

<template>
  <div
    ref="el"
    class="relative -mt-1 z-10"
  >
    <svg
      class="divider-wave w-full h-16 sm:h-24"
      :class="{ 'rotate-180': flip }"
      viewBox="0 0 1440 96"
      preserveAspectRatio="none"
      fill="var(--ui-bg-elevated)"
    >
      <path :d="path" />
    </svg>
  </div>
</template>
