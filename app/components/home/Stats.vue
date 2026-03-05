<script setup lang="ts">
const client = useNeonClient()
const { data: githubRepos } = await useGitHubRepos()

const memberCount = ref(0)
const eventCount = ref(0)

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

const totalStars = computed(() => (githubRepos.value ?? []).reduce((sum: number, r: any) => sum + (r.stars || 0), 0))
const repoCount = computed(() => (githubRepos.value ?? []).length)

const stats = computed(() => [
  { value: memberCount.value, label: 'Members', icon: 'i-lucide-users' },
  { value: eventCount.value, label: 'Events', icon: 'i-lucide-calendar' },
  { value: repoCount.value, label: 'Open Source Repos', icon: 'i-lucide-git-branch' },
  { value: totalStars.value, label: 'GitHub ★', icon: 'i-lucide-star' }
])

const displayStats = ref([0, 0, 0, 0])
const statsRef = ref<HTMLElement>()

// Scroll reveal for the stat items
useScrollReveal(statsRef, '.stat-item', { start: 'top 85%' })

onMounted(async () => {
  await fetchStats()
  await nextTick()
  if (!import.meta.client || !statsRef.value) return
  const gsap = useGSAP()

  // Counter animation — the one special effect worth keeping
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
        displayStats.value[i] = stat.value
      }
    })
  })
})
</script>

<template>
  <section
    ref="statsRef"
    class="py-16 bg-elevated relative z-10"
  >
    <div class="mx-auto max-w-5xl px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="stat-item flex flex-col items-center gap-2"
        >
          <UIcon
            :name="stat.icon"
            class="size-6 text-primary opacity-60"
          />
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
</template>
