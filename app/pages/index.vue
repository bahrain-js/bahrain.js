<script setup lang="ts">
const client = useNeonClient()
const { isAuthenticated, signInWithGitHub } = useAuth()

// ─── Live Data ───
const memberCount = ref(0)
const eventCount = ref(0)
const nextEvent = ref<any>(null)
const githubRepos = ref<any[]>([])

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

async function fetchGithubData() {
  try {
    const { data } = await useFetch<any[]>('/api/github')
    if (data.value) {
      githubRepos.value = data.value
    }
  } catch { /* silent */ }
}

// Computed stats
const totalStars = computed(() => githubRepos.value.reduce((sum, r) => sum + (r.stars || 0), 0))
const repoCount = computed(() => githubRepos.value.length)

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

// ─── GSAP Counter Animation ───
const statsRef = ref<HTMLElement>()

onMounted(async () => {
  await Promise.all([fetchStats(), fetchNextEvent(), fetchGithubData()])
  await nextTick()

  // Start countdown timer (client-only)
  if (nextEvent.value) {
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
  }

  // Animate stat counters using useGSAP composable
  if (import.meta.client && statsRef.value) {
    const gsap = useGSAP()
    stats.value.forEach((stat, i) => {
      const obj = { val: 0 }
      gsap.to(obj, {
        val: stat.value,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: statsRef.value,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          displayStats.value[i] = Math.round(obj.val)
        }
      })
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
    <section class="relative overflow-hidden py-24 sm:py-32">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h1 class="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1]">
          <span
            v-for="(word, i) in ['Where', 'Bahrain\'s', 'JavaScript', 'community']"
            :key="word"
            v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: i * 0.12, ease: 'power3.out' }"
            class="inline-block mr-[0.3em]"
          >{{ word }}</span>
          <br class="hidden sm:block" />
          <span v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: 0.48, ease: 'power3.out' }" class="inline-block text-primary">builds</span>
          <span v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: 0.56, ease: 'power3.out' }" class="inline-block">, </span>
          <span v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: 0.64, ease: 'power3.out' }" class="inline-block text-primary">ships</span>
          <span v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: 0.72, ease: 'power3.out' }" class="inline-block">, and </span>
          <span v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: 0.80, ease: 'power3.out' }" class="inline-block text-primary">connects</span>
          <span v-gsap.once.from="{ y: 40, autoAlpha: 0, duration: 0.8, delay: 0.88, ease: 'power3.out' }" class="inline-block">.</span>
        </h1>

        <p
          v-gsap.once.from="{ y: 20, autoAlpha: 0, duration: 0.6, delay: 0.9, ease: 'power2.out' }"
          class="mt-6 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto"
        >
          Find events, ship open source projects under @bahrainjs, and grow from beginner to maintainer.
        </p>

        <div
          v-gsap.once.from="{ y: 15, autoAlpha: 0, duration: 0.5, delay: 1.1, ease: 'power2.out' }"
          class="mt-8 flex flex-wrap justify-center gap-4"
        >
          <UButton
            v-if="isAuthenticated"
            to="/events"
            label="Browse Events"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
          />
          <UButton
            v-else
            label="Join the community"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
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
          />
        </div>
      </div>
    </section>

    <!-- Community Stats -->
    <section ref="statsRef" class="py-16 bg-[var(--ui-bg-elevated)]">
      <div class="mx-auto max-w-5xl px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div
            v-for="(stat, i) in stats"
            :key="stat.label"
            v-gsap.whenVisible.once.from="{ y: 20, autoAlpha: 0, duration: 0.5, delay: i * 0.1, ease: 'power2.out' }"
            class="flex flex-col items-center gap-2"
          >
            <UIcon :name="stat.icon" class="size-6 text-primary opacity-60" />
            <p class="text-4xl font-extrabold text-primary tabular-nums">
              {{ displayStats[i] }}
            </p>
            <p class="text-sm text-muted">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

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
              <p class="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Next Event</p>
              <NuxtLink :to="`/events/${nextEvent.id}`" class="group">
                <h3 class="text-2xl font-bold group-hover:text-primary transition-colors">
                  {{ nextEvent.title }}
                </h3>
              </NuxtLink>
              <p class="text-sm text-muted mt-1">
                {{ new Date(nextEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
              </p>
              <p v-if="nextEvent.location" class="text-sm text-muted flex items-center gap-1 mt-1">
                <UIcon name="i-lucide-map-pin" class="size-3.5" />
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
    <section class="py-20">
      <div class="mx-auto max-w-5xl px-6">
        <div
          v-gsap.whenVisible.once.from="{ y: 20, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }"
          class="text-center mb-12"
        >
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">More than meetups</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            A signal hub, a builder community, and an on-ramp for JavaScript developers at every level.
          </p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="(feature, i) in features"
            :key="feature.title"
            v-gsap.whenVisible.once.from="{ y: 40, autoAlpha: 0, duration: 0.6, delay: i * 0.12, ease: 'power2.out' }"
          >
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                <UIcon :name="feature.icon" class="size-6 text-primary" />
              </div>
              <h3 class="font-semibold">{{ feature.title }}</h3>
              <p class="text-sm text-muted">{{ feature.description }}</p>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- Pipeline -->
    <section class="py-20 bg-[var(--ui-bg-elevated)]">
      <div class="mx-auto max-w-5xl px-6">
        <div
          v-gsap.whenVisible.once.from="{ y: 20, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }"
          class="text-center mb-12"
        >
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">From idea to npm package</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Bahrain.js isn't just events. It's a factory for open source output.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0">
          <div
            v-for="(step, i) in pipeline"
            :key="step.title"
            v-gsap.whenVisible.once.from="{ x: -30, autoAlpha: 0, duration: 0.5, delay: i * 0.15, ease: 'power2.out' }"
            class="flex items-center gap-2 sm:gap-0"
          >
            <div class="flex flex-col items-center text-center gap-2 px-4 py-4 rounded-xl bg-[var(--ui-bg)] min-w-[110px]">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <UIcon :name="step.icon" class="size-5 text-primary" />
              </div>
              <p class="text-sm font-semibold">{{ step.title }}</p>
              <p class="text-xs text-muted">{{ step.description }}</p>
            </div>
            <UIcon
              v-if="i < pipeline.length - 1"
              name="i-lucide-arrow-right"
              class="size-5 text-zinc-300 dark:text-zinc-600 hidden sm:block mx-2"
            />
            <UIcon
              v-if="i < pipeline.length - 1"
              name="i-lucide-arrow-down"
              class="size-5 text-zinc-300 dark:text-zinc-600 sm:hidden"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Membership Tiers -->
    <section class="py-20">
      <div class="mx-auto max-w-5xl px-6">
        <div
          v-gsap.whenVisible.once.from="{ y: 20, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }"
          class="text-center mb-12"
        >
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Level up</h2>
          <p class="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Transparent progression from attendee to maintainer.
          </p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="(tier, i) in tiers"
            :key="tier.title"
            v-gsap.whenVisible.once.from="{ y: 30, autoAlpha: 0, scale: 0.95, duration: 0.5, delay: i * 0.1, ease: 'back.out(1.4)' }"
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <UIcon :name="tier.icon" class="size-5 text-primary" />
                <p class="font-semibold">{{ tier.title }}</p>
              </div>
              <p class="text-sm text-muted">{{ tier.description }}</p>
              <p class="text-xs text-muted italic mt-1">{{ tier.how }}</p>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section
      v-gsap.whenVisible.once.from="{ y: 20, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }"
      class="py-20 bg-[var(--ui-bg-elevated)]"
    >
      <div class="mx-auto max-w-3xl px-6 text-center">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to build?</h2>
        <p class="mt-4 text-lg text-muted max-w-xl mx-auto">
          Join Bahrain's JavaScript community. Whether you're just learning or shipping production code, there's a place for you.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <UButton
            v-if="!isAuthenticated"
            label="Join the community"
            trailing-icon="i-lucide-arrow-right"
            size="xl"
            @click="signInWithGitHub"
          />
          <UButton
            to="/events"
            label="Browse Events"
            icon="i-lucide-calendar"
            size="xl"
            :variant="isAuthenticated ? 'solid' : 'outline'"
            :color="isAuthenticated ? 'primary' : 'neutral'"
          />
          <UButton
            to="https://github.com/bahrain-js"
            target="_blank"
            label="Explore projects"
            icon="i-simple-icons-github"
            color="neutral"
            variant="outline"
            size="xl"
          />
        </div>
      </div>
    </section>
  </div>
</template>
