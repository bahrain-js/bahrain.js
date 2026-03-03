<script setup lang="ts">
const { isAuthenticated, signInWithGitHub } = useAuth()
const client = useNeonClient()

const loading = ref(true)
const upcoming = ref<any[]>([])
const past = ref<any[]>([])

const eventTypeConfig: Record<string, { icon: string, label: string, color: string }> = {
  'meetup': { icon: 'i-lucide-mic', label: 'Meetup', color: 'text-yellow-500' },
  'builder-session': { icon: 'i-lucide-wrench', label: 'Builder Session', color: 'text-blue-500' },
  'hackathon': { icon: 'i-lucide-trophy', label: 'Hackathon', color: 'text-purple-500' },
  'coffee-and-code': { icon: 'i-lucide-coffee', label: 'Coffee & Code', color: 'text-amber-600' }
}

const formatConfig: Record<string, { icon: string, label: string }> = {
  'in-person': { icon: 'i-lucide-map-pin', label: 'In-person' },
  'virtual': { icon: 'i-lucide-video', label: 'Virtual' },
  'hybrid': { icon: 'i-lucide-globe', label: 'Hybrid' }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

async function fetchEvents() {
  loading.value = true
  try {
    const now = new Date().toISOString()

    const [upcomingRes, pastRes] = await Promise.all([
      client
        .from('events')
        .select('*')
        .gte('date', now)
        .order('date', { ascending: true }),
      client
        .from('events')
        .select('*')
        .lt('date', now)
        .order('date', { ascending: false })
    ])

    if (upcomingRes.error) console.error('Upcoming query error:', upcomingRes.error)
    if (pastRes.error) console.error('Past query error:', pastRes.error)

    upcoming.value = upcomingRes.data || []
    past.value = pastRes.data || []
  } catch (err) {
    console.error('Failed to fetch events:', err)
  } finally {
    loading.value = false
  }
}

function getRsvpCount(_event: any) {
  return 0 // Will be fetched on detail page
}

onMounted(fetchEvents)

useSeoMeta({
  title: 'Events — Bahrain.js',
  description: 'Meetups, builder sessions, hackathons, and coffee & code — find your next Bahrain.js event.'
})
</script>

<template>
  <UContainer class="py-16">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Events
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
        Meetups, builder sessions, hackathons, and coffee & code. Find your next Bahrain.js event.
      </p>

      <!-- Submit Event CTA -->
      <div class="mt-6">
        <UButton
          v-if="isAuthenticated"
          to="/events/submit"
          icon="i-lucide-plus"
          label="Submit an Event"
          color="primary"
        />
        <UButton
          v-else
          icon="i-simple-icons-github"
          label="Sign in to submit events"
          color="neutral"
          variant="outline"
          @click="signInWithGitHub"
        />
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="space-y-4"
    >
      <USkeleton
        v-for="i in 3"
        :key="i"
        class="h-32 rounded-lg"
      />
    </div>

    <template v-else>
      <!-- Upcoming events -->
      <section
        v-if="upcoming.length"
        class="mb-16"
      >
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
          <UIcon
            name="i-lucide-calendar"
            class="text-yellow-500"
          />
          Upcoming
        </h2>
        <div class="grid gap-6">
          <UCard
            v-for="event in upcoming"
            :key="event.id"
            class="hover:ring-2 hover:ring-yellow-400/50 transition-all"
          >
            <div class="flex flex-col sm:flex-row sm:items-start gap-4">
              <!-- Date badge -->
              <div class="shrink-0 text-center bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3 w-20">
                <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {{ new Date(event.date).getDate() }}
                </div>
                <div class="text-xs font-medium text-yellow-600/70 dark:text-yellow-400/70 uppercase">
                  {{ new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) }}
                </div>
              </div>

              <!-- Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    v-if="eventTypeConfig[event.type]"
                    class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
                    :class="eventTypeConfig[event.type]?.color"
                  >
                    <UIcon
                      :name="eventTypeConfig[event.type]?.icon"
                      class="size-3"
                    />
                    {{ eventTypeConfig[event.type]?.label }}
                  </span>
                  <span
                    v-if="formatConfig[event.format]"
                    class="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    <UIcon
                      :name="formatConfig[event.format]?.icon"
                      class="size-3"
                    />
                    {{ formatConfig[event.format]?.label }}
                  </span>
                </div>

                <NuxtLink
                  :to="`/events/${event.id}`"
                  class="group"
                >
                  <h3 class="text-lg font-semibold group-hover:text-yellow-500 transition-colors">
                    {{ event.title }}
                  </h3>
                </NuxtLink>

                <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {{ event.description }}
                </p>

                <div class="flex items-center gap-4 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <span class="flex items-center gap-1">
                    <UIcon
                      name="i-lucide-clock"
                      class="size-3.5"
                    />
                    {{ formatDate(event.date) }} · {{ formatTime(event.date) }}
                  </span>
                  <span
                    v-if="event.location"
                    class="flex items-center gap-1"
                  >
                    <UIcon
                      name="i-lucide-map-pin"
                      class="size-3.5"
                    />
                    {{ event.location }}
                  </span>
                  <span
                    v-if="getRsvpCount(event)"
                    class="flex items-center gap-1"
                  >
                    <UIcon
                      name="i-lucide-users"
                      class="size-3.5"
                    />
                    {{ getRsvpCount(event) }} attending
                  </span>
                </div>
              </div>

              <!-- RSVP button -->
              <div class="flex-shrink-0">
                <UButton
                  :to="`/events/${event.id}`"
                  label="View & RSVP"
                  icon="i-lucide-arrow-right"
                  trailing
                  size="sm"
                />
              </div>
            </div>
          </UCard>
        </div>
      </section>

      <!-- No upcoming events -->
      <section
        v-else
        class="mb-16 text-center py-12"
      >
        <UIcon
          name="i-lucide-calendar-x"
          class="size-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4"
        />
        <p class="text-zinc-500 dark:text-zinc-400">
          No upcoming events right now. Check back soon!
        </p>
      </section>

      <!-- Past events -->
      <section
        v-if="past.length"
        class="opacity-60"
      >
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <UIcon
            name="i-lucide-archive"
            class="text-zinc-400"
          />
          Past Events
        </h2>
        <div class="grid gap-4">
          <UCard
            v-for="event in past"
            :key="event.id"
            class="opacity-75 hover:opacity-100 transition-opacity"
          >
            <div class="flex items-center gap-4">
              <div class="flex-shrink-0 text-center w-16">
                <div class="text-lg font-bold text-zinc-400">
                  {{ new Date(event.date).getDate() }}
                </div>
                <div class="text-xs text-zinc-400 uppercase">
                  {{ new Date(event.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }}
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span
                    v-if="eventTypeConfig[event.type]"
                    class="text-xs font-medium"
                    :class="eventTypeConfig[event.type]?.color"
                  >
                    {{ eventTypeConfig[event.type]?.label }}
                  </span>
                </div>
                <NuxtLink
                  :to="`/events/${event.id}`"
                  class="group"
                >
                  <h3 class="font-medium group-hover:text-yellow-500 transition-colors">
                    {{ event.title }}
                  </h3>
                </NuxtLink>
              </div>

              <div
                v-if="getRsvpCount(event)"
                class="text-sm text-zinc-400 flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-users"
                  class="size-3.5"
                />
                {{ getRsvpCount(event) }}
              </div>
            </div>
          </UCard>
        </div>
      </section>
    </template>
  </UContainer>
</template>
