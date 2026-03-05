<script setup lang="ts">
const frameworkLogos = [
  { name: 'Vue', icon: 'i-simple-icons-vuedotjs', color: 'text-emerald-500' },
  { name: 'React', icon: 'i-simple-icons-react', color: 'text-sky-400' },
  { name: 'Angular', icon: 'i-simple-icons-angular', color: 'text-red-500' },
  { name: 'Svelte', icon: 'i-simple-icons-svelte', color: 'text-orange-500' },
  { name: 'Nuxt', icon: 'i-simple-icons-nuxtdotjs', color: 'text-green-400' },
  { name: 'Next.js', icon: 'i-simple-icons-nextdotjs', color: 'text-white' },
  { name: 'Astro', icon: 'i-simple-icons-astro', color: 'text-orange-400' },
  { name: 'Node.js', icon: 'i-simple-icons-nodedotjs', color: 'text-green-500' },
  { name: 'Deno', icon: 'i-simple-icons-deno', color: 'text-zinc-300' },
  { name: 'Bun', icon: 'i-simple-icons-bun', color: 'text-amber-300' },
  { name: 'TypeScript', icon: 'i-simple-icons-typescript', color: 'text-blue-500' },
  { name: 'Hono', icon: 'i-simple-icons-hono', color: 'text-orange-500' },
  { name: 'Tauri', icon: 'i-simple-icons-tauri', color: 'text-yellow-400' },
  { name: 'Remix', icon: 'i-simple-icons-remix', color: 'text-blue-400' }
]

const topRow = frameworkLogos.slice(0, 7)
const bottomRow = frameworkLogos.slice(7)
</script>

<template>
  <section class="py-16 overflow-hidden">
    <UContainer>
      <h2 class="text-center text-2xl font-bold mb-8 text-muted">
        The JavaScript Ecosystem We ❤️
      </h2>
    </UContainer>

    <div class="space-y-4">
      <UMarquee
        pause-on-hover
      >
        <div
          v-for="fw in topRow"
          :key="fw.name"
          class="flex items-center gap-2 px-6 py-3 rounded-xl bg-elevated mx-2"
        >
          <UIcon
            :name="fw.icon"
            :class="[fw.color, 'size-12 shrink-0']"
          />
          <span class="text-sm font-medium whitespace-nowrap">{{ fw.name }}</span>
        </div>
      </UMarquee>

      <UMarquee
        pause-on-hover
        reverse
      >
        <div
          v-for="fw in bottomRow"
          :key="fw.name"
          class="flex items-center gap-2 px-6 py-3 rounded-xl bg-elevated mx-2"
        >
          <UIcon
            :name="fw.icon"
            :class="[fw.color, 'size-12 shrink-0']"
          />
          <span class="text-sm font-medium whitespace-nowrap">{{ fw.name }}</span>
        </div>
      </UMarquee>
    </div>

    <UContainer>
      <p class="text-center mt-6">
        <NuxtLink
          to="/frameworks"
          class="text-sm text-primary hover:underline"
        >
          Explore all frameworks →
        </NuxtLink>
      </p>
    </UContainer>
  </section>
</template>
