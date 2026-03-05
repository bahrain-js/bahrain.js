<script setup lang="ts">
// Divider wave paths
const dividerPaths = {
  heroToStats: 'M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 L1440,96 L0,96 Z',
  statsToFeatures: 'M0,32 C360,96 720,0 1080,64 C1260,96 1380,48 1440,32 L1440,96 L0,96 Z',
  featuresToPipeline: 'M0,96 C180,32 360,80 540,48 C720,16 900,64 1080,32 C1260,0 1380,48 1440,32 L1440,96 L0,96 Z',
  pipelineToTiers: 'M0,64 C120,32 360,96 600,48 C840,0 1080,80 1320,48 C1380,40 1420,56 1440,64 L1440,96 L0,96 Z'
}

// Divider refs for GSAP animations
const divider1 = ref<{ el?: HTMLElement }>()
const divider2 = ref<{ el?: HTMLElement }>()
const divider3 = ref<{ el?: HTMLElement }>()
const divider4 = ref<{ el?: HTMLElement }>()

function scrollToStats() {
  divider1.value?.el?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  await nextTick()
  if (!import.meta.client) return
  const gsap = useGSAP()

  // Simple fade-in for wave dividers
  const dividers = [divider1, divider2, divider3, divider4]
  dividers.forEach((dividerRef) => {
    if (!dividerRef.value?.el) return
    const wave = dividerRef.value.el.querySelector('.divider-wave')
    if (!wave) return
    gsap.from(wave, {
      autoAlpha: 0,
      y: 10,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: dividerRef.value.el,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    })
  })
})

useSeoMeta({
  title: 'Bahrain.js — Bahrain\'s JavaScript Community',
  description: 'Bahrain\'s JavaScript community — events, open source projects, jobs, and a clear path from beginner to maintainer.'
})
</script>

<template>
  <div>
    <HomeHero @scroll-down="scrollToStats" />

    <HomeDivider
      ref="divider1"
      :path="dividerPaths.heroToStats"
    />

    <HomeStats />

    <HomeDivider
      ref="divider2"
      :path="dividerPaths.statsToFeatures"
      flip
    />

    <HomeCountdown />

    <HomeFrameworkMarquee />

    <HomeFeatures />

    <HomeDivider
      ref="divider3"
      :path="dividerPaths.featuresToPipeline"
    />

    <HomePipeline />

    <HomeDivider
      ref="divider4"
      :path="dividerPaths.pipelineToTiers"
      flip
    />

    <HomeTiers />

    <section class="py-16">
      <UContainer>
        <NewsletterSignup />
      </UContainer>
    </section>

    <HomeCta />
  </div>
</template>
