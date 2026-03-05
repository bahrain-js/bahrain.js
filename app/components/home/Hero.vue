<script setup lang="ts">
const { isAuthenticated, signInWithGitHub } = useAuth()

const emit = defineEmits<{
  scrollDown: []
}>()

const heroRef = ref<HTMLElement>()
const sliderList = ref<HTMLElement>()

const words = ['Events', 'Startups', 'Meetups', 'Workshops', 'Projects', 'Opportunities', 'Connections', 'Careers', 'Community', 'Tools']

onMounted(async () => {
  await nextTick()
  if (!import.meta.client || !heroRef.value) return

  // Stagger entrance animation via CSS keyframes
  const elements = heroRef.value.querySelectorAll<HTMLElement>('.hero-reveal')
  elements.forEach((el, i) => {
    el.style.animation = `reveal-up 0.5s ease ${i * 80}ms both`
  })

  // GSAP vertical word slider
  if (sliderList.value) {
    const gsap = useGSAP()
    const slides = sliderList.value.querySelectorAll('.v-slide')
    const lineHeight = sliderList.value.querySelector('.v-slide')?.getBoundingClientRect().height ?? 80
    const duration = 12 // total loop duration
    const perSlide = duration / slides.length

    const tl = gsap.timeline({ repeat: -1, delay: 1.2 })

    slides.forEach((_, i) => {
      if (i === 0) return // skip first — it's already showing
      tl.to(sliderList.value!, {
        y: i * -1 * lineHeight,
        duration: perSlide,
        ease: 'elastic.out(1, 0.4)'
      })
    })

    // Loop back to first
    tl.to(sliderList.value!, {
      y: 0,
      duration: perSlide,
      ease: 'elastic.out(1, 0.4)'
    })
  }
})
</script>

<template>
  <section
    ref="heroRef"
    class="relative min-h-dvh flex items-center justify-center py-24 sm:py-32"
  >
    <div class="mx-auto max-w-4xl px-6 text-center relative z-10">
      <h1 class="text-4xl sm:text-7xl font-extrabold tracking-tight leading-[1.1]">
        <span
          v-for="(word, i) in ['Bahrain\'s', 'community', 'for']"
          :key="'w' + i"
          class="hero-reveal inline-block mr-[0.3em]"
        >{{ word }}</span>
        <span class="hero-reveal inline-block overflow-hidden align-bottom h-[1.2em] mt-4">
          <span ref="sliderList" class="flex flex-col">
            <span v-for="word in words" :key="word" class="v-slide text-left inline-block text-primary py-2 text-shadow-[0_0_12px_var(--ui-primary)]">
              {{ word }}
            </span>
          </span>
        </span>
      </h1>

      <p class="hero-reveal mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
        Find events, ship open source projects under @bahrain.js, and grow from beginner to maintainer.
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <UButton
          v-if="isAuthenticated"
          to="/events"
          label="Browse Events"
          trailing-icon="i-lucide-arrow-right"
          size="xl"
          class="hero-reveal"
        />
        <UButton
          v-else
          label="Join the community"
          trailing-icon="i-lucide-arrow-right"
          size="xl"
          class="hero-reveal"
          @click="signInWithGitHub"
        />
        <UButton
          to="https://discord.gg/EZrDeaErBV"
          target="_blank"
          label="Join Discord"
          icon="i-simple-icons-discord"
          size="xl"
          color="neutral"
          variant="subtle"
          class="hero-reveal"
        />
      </div>
    </div>

    <!-- Scroll-down arrow -->
    <button
      class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 group flex flex-col items-center gap-1 text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors cursor-pointer"
      aria-label="Scroll to content"
      @click="emit('scrollDown')"
    >
      <span class="text-xs font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity">
        Explore
      </span>
      <span class="relative flex items-center justify-center">
        <span class="absolute size-10 rounded-full bg-primary/10 animate-ping" />
        <UIcon
          name="i-lucide-chevrons-down"
          class="size-6 animate-bounce"
        />
      </span>
    </button>
  </section>
</template>
