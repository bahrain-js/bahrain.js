<script setup lang="ts">
const client = useNeonClient()
const { isAuthenticated, signInWithGitHub } = useAuth()

// ─── Live Data ───
const memberCount = ref(0)
const eventCount = ref(0)
const nextEvent = ref<any>(null)
const { data: githubRepos } = await useGitHubRepos()

async function fetchStats() {
  try {
    const [membersRes, eventsRes] = await Promise.all([
      client.from('members').select('id', { count: 'exact', head: true }),
      client.from('events').select('id', { count: 'exact', head: true })
    ])
    memberCount.value = membersRes.count || 0
    eventCount.value = eventsRes.count || 0
  } catch { /* silent */ }
}

async function fetchNextEvent() {
  try {
    const { data } = await client
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(1)
    if (data?.length) nextEvent.value = data[0]
  } catch { /* silent */ }
}

// Computed stats
const totalStars = computed(() => (githubRepos.value ?? []).reduce((sum: number, r: any) => sum + (r.stars || 0), 0))
const repoCount = computed(() => (githubRepos.value ?? []).length)

const stats = computed(() => [
  { value: memberCount.value, label: 'Members', icon: 'i-lucide-users' },
  { value: eventCount.value, label: 'Events Held', icon: 'i-lucide-calendar' },
  { value: repoCount.value, label: 'Repos', icon: 'i-lucide-git-branch' },
  { value: totalStars.value, label: 'GitHub Stars', icon: 'i-lucide-star' }
])

// Animated stat display values (for counter animation)
const displayStats = ref([0, 0, 0, 0])

// ─── Countdown Timer ───
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownInterval: ReturnType<typeof setInterval>

function updateCountdown() {
  if (!nextEvent.value?.date) return
  const diff = new Date(nextEvent.value.date).getTime() - Date.now()
  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  }
}

onUnmounted(() => clearInterval(countdownInterval))

// ─── Static Data ───
const heroWords = [
  { text: 'Where', highlight: false },
  { text: 'Bahrain\'s', highlight: false },
  { text: 'JavaScript', highlight: false },
  { text: 'community', highlight: false }
]

const heroActions = [
  { text: 'builds', highlight: true },
  { text: ', ', highlight: false },
  { text: 'ships', highlight: true },
  { text: ', and ', highlight: false },
  { text: 'connects', highlight: true },
  { text: '.', highlight: false }
]

const features = [
  { icon: 'i-lucide-radio', title: 'Signal Hub', description: 'One place for events, projects, jobs, and people in Bahrain\'s JS scene.' },
  { icon: 'i-lucide-hammer', title: 'Builder Community', description: 'Ship code, present work, and collaborate on open source under @bahrainjs.' },
  { icon: 'i-lucide-package', title: 'Open Source Pipeline', description: 'Ideas become npm packages at builder sessions. Tangible output.' },
  { icon: 'i-lucide-graduation-cap', title: 'Clear On-Ramp', description: 'From "just learned JS" to maintainer. The path is transparent.' }
]

const pipeline = [
  { icon: 'i-lucide-lightbulb', title: 'Idea', description: 'Surface at meetups or chat' },
  { icon: 'i-lucide-hammer', title: 'Build', description: 'Hands-on coding session' },
  { icon: 'i-lucide-flask-conical', title: 'Prototype', description: 'Working proof of concept' },
  { icon: 'i-lucide-git-branch', title: 'Repo', description: 'Under bahrain-js org' },
  { icon: 'i-lucide-package', title: 'Publish', description: 'Ship to npm' }
]

const tiers = [
  { icon: 'i-lucide-user', title: 'Member', description: 'Attending events and learning', how: 'Sign up and join the chat' },
  { icon: 'i-lucide-git-pull-request', title: 'Contributor', description: 'Merged PRs, talks, or posts', how: 'Submit a PR or give a talk' },
  { icon: 'i-lucide-shield', title: 'Maintainer', description: 'Stewards specific projects', how: 'Consistent contributions' },
  { icon: 'i-lucide-crown', title: 'Core Team', description: 'Stewards of the org', how: 'Sustained community impact' }
]

// ─── Template Refs for GSAP ───
const heroRef = ref<HTMLElement>()
const statsRef = ref<HTMLElement>()
const featuresRef = ref<HTMLElement>()
const pipelineRef = ref<HTMLElement>()
const tiersRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const particleContainer = ref<HTMLElement>()
const divider1 = ref<HTMLElement>()
const divider2 = ref<HTMLElement>()
const divider3 = ref<HTMLElement>()
const divider4 = ref<HTMLElement>()

// ─── GSAP Animations ───
onMounted(async () => {
  await Promise.all([fetchStats(), fetchNextEvent()])
  await nextTick()

  // Start countdown timer
  if (nextEvent.value) {
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
  }

  if (!import.meta.client) return
  const gsap = useGSAP()

  // ═══ HERO: Cinematic entrance timeline ═══
  if (heroRef.value) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Gradient orbs fade in
    heroTl.from('.hero-orb', {
      scale: 0,
      autoAlpha: 0,
      duration: 1.2,
      stagger: 0.2,
      ease: 'power2.out'
    })

    // Title words: 3D flip + blur clear
    heroTl.from('.hero-word', {
      rotationX: 90,
      autoAlpha: 0,
      filter: 'blur(8px)',
      y: 40,
      duration: 0.7,
      stagger: 0.1,
      transformOrigin: 'bottom center',
      ease: 'back.out(1.4)'
    }, 0.2)

    // Action words: typed-cursor effect (sequential highlight)
    heroTl.from('.hero-action', {
      autoAlpha: 0,
      y: 20,
      filter: 'blur(4px)',
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out'
    }, '-=0.3')

    // Highlight pulse on action words
    heroTl.fromTo('.hero-action-highlight', {
      textShadow: '0 0 0px var(--ui-primary)'
    }, {
      textShadow: '0 0 20px var(--ui-primary)',
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    }, '-=0.5')

    // Subtitle slide up
    heroTl.from('.hero-subtitle', {
      y: 30,
      autoAlpha: 0,
      filter: 'blur(4px)',
      duration: 0.7,
      ease: 'power2.out'
    }, '-=0.4')

    // CTA buttons: bouncy entrance
    heroTl.from('.hero-cta', {
      y: 30,
      autoAlpha: 0,
      scale: 0.9,
      duration: 0.5,
      stagger: 0.12,
      ease: 'back.out(1.7)'
    }, '-=0.3')

    // Floating particles
    if (particleContainer.value) {
      const particles = particleContainer.value.querySelectorAll('.particle')
      particles.forEach((p) => {
        const startX = Math.random() * 100
        const startY = Math.random() * 100
        const size = 2 + Math.random() * 4
        const el = p as HTMLElement
        el.style.left = `${startX}%`
        el.style.top = `${startY}%`
        el.style.width = `${size}px`
        el.style.height = `${size}px`

        gsap.to(p, {
          y: `random(-60, 60)`,
          x: `random(-40, 40)`,
          duration: `random(3, 6)`,
          autoAlpha: `random(0.2, 0.7)`,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 3
        })
      })
    }

    // ═══ HERO EXIT: Scale down + blur as you scroll past ═══
    gsap.to(heroRef.value, {
      scale: 0.92,
      filter: 'blur(6px)',
      autoAlpha: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: heroRef.value,
        start: 'center center',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  // ═══ STATS: Counter + icon spin + scale pulse ═══
  if (statsRef.value) {
    const statItems = statsRef.value.querySelectorAll('.stat-item')
    const statIcons = statsRef.value.querySelectorAll('.stat-icon')

    // Stagger reveal
    gsap.from(statItems, {
      y: 40,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: statsRef.value,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    })

    // Icon spin
    gsap.from(statIcons, {
      rotation: -180,
      scale: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: statsRef.value,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    })

    // Counter animation with pulse
    stats.value.forEach((stat, i) => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: stat.value,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: statsRef.value,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        delay: i * 0.15,
        onUpdate: () => {
          displayStats.value[i] = Math.round(obj.val)
        },
        onComplete: () => {
          // Scale pulse when counter finishes
          const numEl = statsRef.value?.querySelectorAll('.stat-number')[i]
          if (numEl) {
            gsap.fromTo(numEl, { scale: 1 }, {
              scale: 1.15,
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              ease: 'power2.out'
            })
          }
        }
      })
    })
  }

  // ═══ FEATURES: Cascading cards from alternating sides ═══
  if (featuresRef.value) {
    const featureCards = featuresRef.value.querySelectorAll('.feature-card')
    const featureIcons = featuresRef.value.querySelectorAll('.feature-icon')

    // Section header
    gsap.from(featuresRef.value.querySelector('.section-header')!, {
      y: 30,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: featuresRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    // Cards from alternating directions with rotation
    featureCards.forEach((card, i) => {
      const fromLeft = i % 2 === 0
      gsap.from(card, {
        x: fromLeft ? -60 : 60,
        y: 40,
        autoAlpha: 0,
        rotation: fromLeft ? -3 : 3,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      })
    })

    // Icon pop-in after card appears
    featureIcons.forEach((icon) => {
      gsap.from(icon, {
        scale: 0,
        rotation: -90,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: icon,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      })
    })
  }

  // ═══ PIPELINE: Scroll-scrubbed step reveal ═══
  if (pipelineRef.value) {
    const pipelineSteps = pipelineRef.value.querySelectorAll('.pipeline-step')
    const pipelineArrows = pipelineRef.value.querySelectorAll('.pipeline-arrow')

    // Section header
    gsap.from(pipelineRef.value.querySelector('.section-header')!, {
      y: 30,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: pipelineRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    // Steps reveal with scrub
    const pipelineTl = gsap.timeline({
      scrollTrigger: {
        trigger: pipelineRef.value.querySelector('.pipeline-track')!,
        start: 'top 75%',
        end: 'bottom 50%',
        scrub: 0.8
      }
    })

    pipelineSteps.forEach((step, i) => {
      // Step fades in and scales up
      pipelineTl.fromTo(step, {
        autoAlpha: 0.2,
        scale: 0.85,
        y: 20
      }, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out'
      }, i * 0.5)

      // Arrow draws in after step
      if (pipelineArrows[i]) {
        pipelineTl.fromTo(pipelineArrows[i], {
          autoAlpha: 0,
          scaleX: 0
        }, {
          autoAlpha: 1,
          scaleX: 1,
          duration: 0.5,
          ease: 'power2.out'
        }, i * 0.5 + 0.3)
      }
    })

    // Progress line
    const progressLine = pipelineRef.value.querySelector('.pipeline-progress')
    if (progressLine) {
      gsap.fromTo(progressLine, { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: pipelineRef.value.querySelector('.pipeline-track')!,
          start: 'top 75%',
          end: 'bottom 50%',
          scrub: 0.5
        }
      })
    }
  }

  // ═══ TIERS: 3D card flip reveal ═══
  if (tiersRef.value) {
    // Section header
    gsap.from(tiersRef.value.querySelector('.section-header')!, {
      y: 30,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: tiersRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    const tierCards = tiersRef.value.querySelectorAll('.tier-card')
    tierCards.forEach((card, i) => {
      gsap.from(card, {
        rotationY: 90,
        autoAlpha: 0,
        scale: 0.8,
        duration: 0.8,
        delay: i * 0.12,
        ease: 'back.out(1.4)',
        transformOrigin: 'center center',
        scrollTrigger: {
          trigger: tiersRef.value,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      })
    })

    // Gold shimmer on Core Team card (last one)
    const coreCard = tierCards[tierCards.length - 1]
    if (coreCard) {
      gsap.to(coreCard.querySelector('.tier-shimmer'), {
        backgroundPosition: '200% center',
        duration: 2,
        delay: 1.5,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: tiersRef.value,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      })
    }
  }

  // ═══ CTA: Parallax + elastic entrance ═══
  if (ctaRef.value) {
    // Parallax background orbs
    gsap.to(ctaRef.value.querySelector('.cta-orb-1'), {
      yPercent: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
    gsap.to(ctaRef.value.querySelector('.cta-orb-2'), {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })

    // Text reveal
    gsap.from(ctaRef.value.querySelector('.cta-title')!, {
      y: 40,
      autoAlpha: 0,
      filter: 'blur(6px)',
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    gsap.from(ctaRef.value.querySelector('.cta-desc')!, {
      y: 20,
      autoAlpha: 0,
      duration: 0.6,
      delay: 0.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    })

    // Buttons: elastic pop
    gsap.from(ctaRef.value.querySelectorAll('.cta-btn'), {
      y: 30,
      autoAlpha: 0,
      scale: 0.85,
      duration: 0.6,
      stagger: 0.1,
      ease: 'elastic.out(1, 0.5)',
      scrollTrigger: {
        trigger: ctaRef.value,
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    })
  }

  // ═══ SECTION TRANSITIONS: Animated dividers + reveals ═══

  // Wave divider 1: Hero → Stats — the SVG path draws itself
  if (divider1.value) {
    gsap.fromTo(divider1.value.querySelector('.divider-wave')!, {
      clipPath: 'inset(0 100% 0 0)'
    }, {
      clipPath: 'inset(0 0% 0 0)',
      ease: 'power2.out',
      scrollTrigger: {
        trigger: divider1.value,
        start: 'top 90%',
        end: 'top 50%',
        scrub: 0.5
      }
    })
  }

  // Stats section parallax lift (rises slightly faster)
  if (statsRef.value) {
    gsap.fromTo(statsRef.value, {
      yPercent: 8
    }, {
      yPercent: -3,
      ease: 'none',
      scrollTrigger: {
        trigger: statsRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  // Wave divider 2: Stats → Features — slide from right
  if (divider2.value) {
    gsap.from(divider2.value, {
      xPercent: 50,
      autoAlpha: 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: divider2.value,
        start: 'top 90%',
        end: 'top 60%',
        scrub: 0.5
      }
    })
  }

  // Features → Pipeline divider: diagonal wipe
  if (divider3.value) {
    gsap.fromTo(divider3.value.querySelector('.divider-wave')!, {
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)'
    }, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: divider3.value,
        start: 'top 85%',
        end: 'top 50%',
        scrub: 0.6
      }
    })
  }

  // Pipeline → Tiers divider: grow from center
  if (divider4.value) {
    gsap.fromTo(divider4.value.querySelector('.divider-wave')!, {
      clipPath: 'inset(0 50% 0 50%)'
    }, {
      clipPath: 'inset(0 0% 0 0%)',
      ease: 'power3.out',
      scrollTrigger: {
        trigger: divider4.value,
        start: 'top 85%',
        end: 'top 55%',
        scrub: 0.5
      }
    })
  }

  // Features section: slight parallax
  if (featuresRef.value) {
    gsap.fromTo(featuresRef.value, {
      yPercent: 4
    }, {
      yPercent: -2,
      ease: 'none',
      scrollTrigger: {
        trigger: featuresRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }

  // Tiers section: gentle parallax
  if (tiersRef.value) {
    gsap.fromTo(tiersRef.value, {
      yPercent: 5
    }, {
      yPercent: -2,
      ease: 'none',
      scrollTrigger: {
        trigger: tiersRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }
})

useSeoMeta({
  title: 'Bahrain.js — JavaScript Community',
  description: 'The home of JavaScript in Bahrain. Build, ship, learn, and connect with the local JS community.'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section
      ref="heroRef"
      class="relative overflow-hidden py-24 sm:py-32"
    >
      <!-- Animated gradient orbs -->
      <div class="hero-orb absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div class="hero-orb absolute -bottom-32 -right-32 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      <div class="hero-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

      <!-- Floating particles -->
      <div
        ref="particleContainer"
        class="absolute inset-0 pointer-events-none"
      >
        <div
          v-for="i in 20"
          :key="i"
          class="particle absolute rounded-full bg-primary/30 opacity-0"
        />
      </div>

      <div class="mx-auto max-w-4xl px-6 text-center relative z-10">
        <h1
          class="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1]"
          style="perspective: 800px"
        >
          <span
            v-for="(word, i) in heroWords"
            :key="'w' + i"
            class="hero-word inline-block mr-[0.3em]"
            style="visibility: hidden"
          >{{ word.text }}</span>
          <br class="hidden sm:block">
          <span
            v-for="(action, i) in heroActions"
            :key="'a' + i"
            class="inline-block"
            :class="[
              'hero-action',
              action.highlight ? 'hero-action-highlight text-primary' : ''
            ]"
            style="visibility: hidden"
          >{{ action.text }}</span>
        </h1>

        <p
          class="hero-subtitle mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto"
          style="visibility: hidden"
        >
          Find events, ship open source projects under @bahrainjs, and grow from beginner to maintainer.
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <UButton
            v-if="isAuthenticated"
            to="/events"
            label="Browse Events"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
            class="hero-cta"
            style="visibility: hidden"
          />
          <UButton
            v-else
            label="Join the community"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
            class="hero-cta"
            style="visibility: hidden"
            @click="signInWithGitHub"
          />
          <UButton
            to="https://github.com/bahrain-js"
            target="_blank"
            label="GitHub Org"
            icon="i-simple-icons-github"
            size="xl"
            color="neutral"
            variant="subtle"
            class="hero-cta"
            style="visibility: hidden"
          />
        </div>
      </div>
    </section>

    <!-- Divider: Hero → Stats -->
    <div
      ref="divider1"
      class="relative -mt-1 z-10"
    >
      <svg
        class="divider-wave w-full h-16 sm:h-24"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        fill="var(--ui-bg-elevated)"
      >
        <path d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 L1440,96 L0,96 Z" />
      </svg>
    </div>

    <!-- Community Stats -->
    <section
      ref="statsRef"
      class="py-16 bg-[var(--ui-bg-elevated)] relative z-10"
    >
      <div class="mx-auto max-w-5xl px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            class="stat-item flex flex-col items-center gap-2"
            style="visibility: hidden"
          >
            <UIcon
              :name="stat.icon"
              class="stat-icon size-6 text-primary opacity-60"
            />
            <p class="stat-number text-4xl font-extrabold text-primary tabular-nums">
              {{ displayStats[i] }}
            </p>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Divider: Stats → Events/Features -->
    <div
      ref="divider2"
      class="relative -mt-1 z-10"
    >
      <svg
        class="divider-wave w-full h-16 sm:h-24 rotate-180"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        fill="var(--ui-bg-elevated)"
      >
        <path d="M0,32 C360,96 720,0 1080,64 C1260,96 1380,48 1440,32 L1440,96 L0,96 Z" />
      </svg>
    </div>

    <!-- Next Event Countdown -->
    <section
      v-if="nextEvent"
      v-gsap.whenVisible.once.from="{ y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }"
      class="py-16"
    >
      <div class="mx-auto max-w-3xl px-6">
        <UCard class="overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center gap-6">
            <div class="flex-1">
              <p class="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Next Event
              </p>
              <NuxtLink
                :to="`/events/${nextEvent.id}`"
                class="group"
              >
                <h3 class="text-2xl font-bold group-hover:text-primary transition-colors">
                  {{ nextEvent.title }}
                </h3>
              </NuxtLink>
              <p class="text-sm text-muted mt-1">
                {{ new Date(nextEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
              </p>
              <p
                v-if="nextEvent.location"
                class="text-sm text-muted flex items-center gap-1 mt-1"
              >
                <UIcon
                  name="i-lucide-map-pin"
                  class="size-3.5"
                />
                {{ nextEvent.location }}
              </p>
            </div>

            <!-- Countdown -->
            <div class="flex gap-3 sm:gap-4 flex-shrink-0">
              <div
                v-for="(unit, i) in [{ value: countdown.days, label: 'Days' }, { value: countdown.hours, label: 'Hrs' }, { value: countdown.minutes, label: 'Min' }, { value: countdown.seconds, label: 'Sec' }]"
                :key="unit.label"
                v-gsap.once.from="{ scale: 0.8, autoAlpha: 0, duration: 0.4, delay: 0.2 + i * 0.1, ease: 'back.out(1.7)' }"
                class="text-center"
              >
                <div class="text-2xl sm:text-3xl font-mono font-bold text-primary tabular-nums">
                  {{ String(unit.value).padStart(2, '0') }}
                </div>
                <div class="text-[10px] uppercase tracking-wider text-muted mt-1">
                  {{ unit.label }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 flex gap-3">
            <UButton
              :to="`/events/${nextEvent.id}`"
              label="View & RSVP"
              icon="i-lucide-arrow-right"
              trailing
              size="sm"
            />
          </div>
        </UCard>
      </div>
    </section>

    <!-- What We're About -->
    <section
      ref="featuresRef"
      class="py-20"
    >
      <div class="mx-auto max-w-5xl px-6">
        <div
          class="section-header text-center mb-12"
          style="visibility: hidden"
        >
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            More than meetups
          </h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            A signal hub, a builder community, and an on-ramp for JavaScript developers at every level.
          </p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
            style="visibility: hidden"
          >
            <div class="flex flex-col gap-3">
              <div class="feature-icon flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
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

    <!-- Divider: Features → Pipeline -->
    <div
      ref="divider3"
      class="relative -mt-1 z-10"
    >
      <svg
        class="divider-wave w-full h-16 sm:h-24"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        fill="var(--ui-bg-elevated)"
      >
        <path d="M0,96 C180,32 360,80 540,48 C720,16 900,64 1080,32 C1260,0 1380,48 1440,32 L1440,96 L0,96 Z" />
      </svg>
    </div>

    <!-- Pipeline -->
    <section
      ref="pipelineRef"
      class="py-20 bg-[var(--ui-bg-elevated)] relative z-10"
    >
      <div class="mx-auto max-w-5xl px-6">
        <div
          class="section-header text-center mb-12"
          style="visibility: hidden"
        >
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            From idea to npm package
          </h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Bahrain.js isn't just events. It's a factory for open source output.
          </p>
        </div>

        <!-- Pipeline track with progress line -->
        <div class="pipeline-track relative">
          <!-- Background track line -->
          <div class="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 mx-16" />
          <!-- Animated progress line -->
          <div
            class="pipeline-progress hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-primary -translate-y-1/2 mx-16 origin-left"
            style="transform: scaleX(0)"
          />

          <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 relative">
            <div
              v-for="(step, i) in pipeline"
              :key="step.title"
              class="flex items-center gap-2 sm:gap-0"
            >
              <div
                class="pipeline-step flex flex-col items-center text-center gap-2 px-4 py-4 rounded-xl bg-[var(--ui-bg)] min-w-[110px] relative z-10 border border-transparent hover:border-primary/30 transition-colors"
                style="visibility: hidden"
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
                class="pipeline-arrow size-5 text-primary hidden sm:block mx-2 origin-left"
                style="visibility: hidden"
              />
              <UIcon
                v-if="i < pipeline.length - 1"
                name="i-lucide-arrow-down"
                class="pipeline-arrow size-5 text-primary sm:hidden origin-top"
                style="visibility: hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Divider: Pipeline → Tiers -->
    <div
      ref="divider4"
      class="relative -mt-1 z-10"
    >
      <svg
        class="divider-wave w-full h-16 sm:h-24 rotate-180"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        fill="var(--ui-bg-elevated)"
      >
        <path d="M0,64 C120,32 360,96 600,48 C840,0 1080,80 1320,48 C1380,40 1420,56 1440,64 L1440,96 L0,96 Z" />
      </svg>
    </div>

    <!-- Membership Tiers -->
    <section
      ref="tiersRef"
      class="py-20"
      style="perspective: 1000px"
    >
      <div class="mx-auto max-w-5xl px-6">
        <div
          class="section-header text-center mb-12"
          style="visibility: hidden"
        >
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Level up
          </h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Transparent progression from attendee to maintainer.
          </p>
        </div>
        <div
          class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          style="perspective: 1000px"
        >
          <UCard
            v-for="(tier, i) in tiers"
            :key="tier.title"
            class="tier-card relative overflow-hidden"
            style="visibility: hidden; transform-style: preserve-3d; backface-visibility: hidden"
          >
            <!-- Shimmer overlay for Core Team -->
            <div
              v-if="i === tiers.length - 1"
              class="tier-shimmer absolute inset-0 pointer-events-none"
              style="background: linear-gradient(90deg, transparent 0%, rgba(234, 179, 8, 0.15) 50%, transparent 100%); background-size: 200% 100%; background-position: -100% center"
            />
            <div class="flex flex-col gap-2 relative z-10">
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

    <!-- CTA -->
    <section
      ref="ctaRef"
      class="py-20 bg-[var(--ui-bg-elevated)] relative overflow-hidden"
    >
      <!-- Parallax orbs -->
      <div class="cta-orb-1 absolute -top-20 -right-20 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
      <div class="cta-orb-2 absolute -bottom-20 -left-20 w-72 h-72 bg-yellow-400/8 rounded-full blur-3xl" />

      <div class="mx-auto max-w-3xl px-6 text-center relative z-10">
        <h2
          class="cta-title text-3xl sm:text-4xl font-extrabold tracking-tight"
          style="visibility: hidden"
        >
          Ready to build?
        </h2>
        <p
          class="cta-desc mt-4 text-lg text-muted max-w-xl mx-auto"
          style="visibility: hidden"
        >
          Join Bahrain's JavaScript community. Whether you're just learning or shipping production code, there's a place for you.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <UButton
            v-if="!isAuthenticated"
            label="Join the community"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
            class="cta-btn"
            style="visibility: hidden"
            @click="signInWithGitHub"
          />
          <UButton
            to="/events"
            label="Browse Events"
            icon="i-lucide-calendar"
            size="xl"
            :variant="isAuthenticated ? 'solid' : 'outline'"
            :color="isAuthenticated ? 'primary' : 'neutral'"
            class="cta-btn"
            style="visibility: hidden"
          />
          <UButton
            to="https://github.com/bahrain-js"
            target="_blank"
            label="Explore projects"
            icon="i-simple-icons-github"
            color="neutral"
            variant="outline"
            size="xl"
            class="cta-btn"
            style="visibility: hidden"
          />
        </div>
      </div>
    </section>
  </div>
</template>
