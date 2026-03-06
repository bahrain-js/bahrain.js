<script setup lang="ts">
import type { CommunityEvent, EventRsvpWithMember, Member } from '~/types'

const route = useRoute()
const { user, isAuthenticated, signInWithGitHub } = useAuth()
const { isAdmin } = useAdmin()
const client = useNeonClient()

const eventId = route.params.id as string
const event = ref<CommunityEvent | null>(null)
const rsvps = ref<EventRsvpWithMember[]>([])
const loading = ref(true)
const rsvpLoading = ref(false)

const eventTypeConfig: Record<string, { icon: string, label: string, color: string }> = {
  'meetup': { icon: 'i-lucide-mic', label: 'Meetup', color: 'text-yellow-500' },
  'builder-session': { icon: 'i-lucide-wrench', label: 'Builder Session', color: 'text-blue-500' },
  'hackathon': { icon: 'i-lucide-trophy', label: 'Hackathon', color: 'text-purple-500' },
  'coffee-and-code': { icon: 'i-lucide-coffee', label: 'Coffee & Code', color: 'text-amber-600' }
}

const formatConfigMap: Record<string, { icon: string, label: string }> = {
  'in-person': { icon: 'i-lucide-map-pin', label: 'In-person' },
  'virtual': { icon: 'i-lucide-video', label: 'Virtual' },
  'hybrid': { icon: 'i-lucide-globe', label: 'Hybrid' }
}

const isUpcoming = computed(() => event.value && new Date(event.value.date) >= new Date())
const hasRsvped = computed(() => {
  if (!user.value) return false
  return rsvps.value.some(r => r.user_id === user.value.id)
})
const canEditEvent = computed(() => {
  if (!event.value || !user.value) return false
  const isSubmitter = event.value.submitted_by === user.value.id
  return (isSubmitter && ['draft', 'pending'].includes(event.value.status)) || isAdmin.value
})

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

async function fetchEvent() {
  loading.value = true
  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('id', eventId)
      .limit(1)

    if (error || !data?.length) {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }
    event.value = data[0]

    // Fetch RSVPs
    const { data: rsvpData } = await client
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)

    if (rsvpData?.length) {
      // Lookup member info for each RSVP user
      const userIds = rsvpData.map((r: { user_id: string }) => r.user_id)
      const { data: memberData } = await client
        .from('members')
        .select('user_id, display_name, avatar_url, github_username')
        .in('user_id', userIds)

      type MemberPick = Pick<Member, 'user_id' | 'display_name' | 'avatar_url' | 'github_username'>
      const memberMap = new Map((memberData || []).map((m: MemberPick) => [m.user_id, m]))
      rsvps.value = rsvpData.map((r: { id: string, event_id: number, user_id: string, created_at: string }) => ({
        ...r,
        member: memberMap.get(r.user_id) || null
      }))
    } else {
      rsvps.value = []
    }
  } catch (err: unknown) {
    if (err instanceof Error && 'statusCode' in err && (err as { statusCode: number }).statusCode === 404) throw err
    console.error('Failed to fetch event:', err)
  } finally {
    loading.value = false
  }
}

async function toggleRsvp() {
  if (!user.value) return
  rsvpLoading.value = true

  try {
    if (hasRsvped.value) {
      // Cancel RSVP
      await client
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.value.id)

      rsvps.value = rsvps.value.filter(r => r.user_id !== user.value.id)
    } else {
      // RSVP
      const { data, error } = await client
        .from('event_rsvps')
        .insert({ event_id: Number(eventId), user_id: user.value.id })
        .select('*')

      if (error) throw error
      if (data?.length) {
        // Lookup member info for this user
        const { data: memberData } = await client
          .from('members')
          .select('user_id, display_name, avatar_url, github_username')
          .eq('user_id', user.value.id)
          .limit(1)

        rsvps.value.push({
          ...data[0],
          member: memberData?.[0] || null
        })
      }
    }
  } catch (err) {
    console.error('Failed to toggle RSVP:', err)
    alert('Failed to update RSVP. Please try again.')
  } finally {
    rsvpLoading.value = false
  }
}

onMounted(fetchEvent)

watchEffect(() => {
  if (event.value) {
    useSeoMeta({
      title: `${event.value.title} — Bahrain.js Events`,
      description: event.value.description
    })
  }
})
</script>

<template>
  <UContainer class="py-16 max-w-3xl">
    <!-- Loading -->
    <div
      v-if="loading"
      class="space-y-4"
    >
      <USkeleton class="h-8 w-48" />
      <USkeleton class="h-12 w-full" />
      <USkeleton class="h-6 w-3/4" />
      <div class="grid sm:grid-cols-2 gap-4 mt-8">
        <USkeleton class="h-20" />
        <USkeleton class="h-20" />
      </div>
    </div>

    <template v-else-if="event">
      <!-- Back link -->
      <NuxtLink
        to="/events"
        class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-yellow-500 transition-colors mb-8"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        All events
      </NuxtLink>

      <!-- Header -->
      <header class="mb-8">
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span
            v-if="eventTypeConfig[event.type]"
            class="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800"
            :class="eventTypeConfig[event.type]?.color"
          >
            <UIcon
              :name="eventTypeConfig[event.type]?.icon"
              class="size-4"
            />
            {{ eventTypeConfig[event.type]?.label }}
          </span>
          <span
            v-if="formatConfigMap[event.format]"
            class="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400"
          >
            <UIcon
              :name="formatConfigMap[event.format]?.icon"
              class="size-4"
            />
            {{ formatConfigMap[event.format]?.label }}
          </span>
          <span
            v-if="isUpcoming"
            class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          >
            Upcoming
          </span>
          <span
            v-else
            class="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
          >
            Past event
          </span>
        </div>

        <div class="flex items-start justify-between gap-4">
          <h1 class="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {{ event.title }}
          </h1>
          <UButton
            v-if="canEditEvent"
            :to="`/events/${eventId}/edit`"
            label="Edit"
            icon="i-lucide-pencil"
            variant="outline"
            color="neutral"
            size="sm"
          />
        </div>

        <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
          {{ event.description }}
        </p>
      </header>

      <!-- Info cards -->
      <div class="grid sm:grid-cols-2 gap-4 mb-10">
        <UCard>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-calendar"
              class="size-5 text-yellow-500"
            />
            <div>
              <div class="text-sm font-medium">
                {{ formatDate(event.date) }}
              </div>
              <div class="text-xs text-zinc-500 dark:text-zinc-400">
                {{ formatTime(event.date) }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard v-if="event.location">
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-map-pin"
              class="size-5 text-yellow-500"
            />
            <div>
              <div class="text-sm font-medium">
                {{ event.location }}
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- RSVP section for upcoming events -->
      <div
        v-if="isUpcoming"
        class="mb-10"
      >
        <UCard>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-users"
                class="size-5 text-yellow-500"
              />
              <div>
                <div class="font-medium">
                  {{ rsvps.length }} {{ rsvps.length === 1 ? 'person' : 'people' }} attending
                </div>
                <div
                  v-if="hasRsvped"
                  class="text-xs text-green-500"
                >
                  You're going!
                </div>
              </div>
            </div>

            <UButton
              v-if="isAuthenticated"
              :label="hasRsvped ? 'Cancel RSVP' : 'RSVP'"
              :icon="hasRsvped ? 'i-lucide-x' : 'i-lucide-check'"
              :color="hasRsvped ? 'neutral' : 'primary'"
              :variant="hasRsvped ? 'outline' : 'solid'"
              :loading="rsvpLoading"
              @click="toggleRsvp"
            />
            <UButton
              v-else
              label="Sign in to RSVP"
              icon="i-simple-icons-github"
              color="neutral"
              variant="outline"
              @click="signInWithGitHub"
            />
          </div>

          <!-- Attendee avatars -->
          <div
            v-if="rsvps.length"
            class="mt-4 flex flex-wrap gap-2"
          >
            <div
              v-for="rsvp in rsvps"
              :key="rsvp.id"
              class="flex items-center gap-1.5 text-sm"
            >
              <UAvatar
                :src="rsvp.member?.avatar_url"
                :alt="rsvp.member?.display_name || 'Attendee'"
                size="xs"
              />
              <span class="text-zinc-600 dark:text-zinc-400">{{ rsvp.member?.display_name || 'Member' }}</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Event details body -->
      <div
        v-if="event.details"
        class="prose dark:prose-invert max-w-none whitespace-pre-line"
      >
        {{ event.details }}
      </div>

      <!-- Speakers section -->
      <div
        v-if="event.speakers?.length"
        class="mt-10"
      >
        <h2 class="text-xl font-bold mb-4">
          Speakers
        </h2>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="speaker in event.speakers"
            :key="speaker"
            variant="subtle"
            color="neutral"
            size="lg"
          >
            {{ speaker }}
          </UBadge>
        </div>
      </div>
    </template>
  </UContainer>
</template>
