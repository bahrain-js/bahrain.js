<script setup lang="ts">
import type { CommunityEvent } from '~/types'

const client = useNeonClient()

const nextEvent = ref<CommunityEvent | null>(null)
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownInterval: ReturnType<typeof setInterval>

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

onMounted(async () => {
  await fetchNextEvent()
  if (nextEvent.value) {
    updateCountdown()
    countdownInterval = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => clearInterval(countdownInterval))
</script>

<template>
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
          <div class="flex gap-3 sm:gap-4 shrink-0">
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
</template>
