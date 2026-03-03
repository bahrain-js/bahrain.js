<script setup lang="ts">
import { Time, CalendarDate } from '@internationalized/date'

const route = useRoute()
const { user, isAuthenticated, loading: authLoading } = useAuth()
const { isAdmin } = useAdmin()
const client = useNeonClient()

const eventId = route.params.id as string
const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const canEdit = ref(false)

const form = ref({
  title: '',
  description: '',
  details: '',
  date: null as any,
  time: new Time(18, 0) as any,
  format: 'in-person',
  type: 'meetup',
  location: '',
  speakers: '',
  status: 'pending'
})

const types = [
  { label: 'Meetup', value: 'meetup' },
  { label: 'Builder Session', value: 'builder-session' },
  { label: 'Hackathon', value: 'hackathon' },
  { label: 'Coffee & Code', value: 'coffee-and-code' }
]

const formats = [
  { label: 'In-person', value: 'in-person' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'Hybrid', value: 'hybrid' }
]

// Generate 30-min interval time slots from 00:00 to 23:30
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  return { hour, minute, label }
})

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

    const event = data[0]

    // Check permissions: submitter (draft/pending only) or core team
    const isSubmitter = event.submitted_by === user.value?.id
    const isEditable = isSubmitter && ['draft', 'pending'].includes(event.status)
    canEdit.value = isEditable || isAdmin.value

    if (!canEdit.value) {
      navigateTo(`/events/${eventId}`)
      return
    }

    // Parse date and time from ISO string
    const eventDate = new Date(event.date)
    const parsedDate = new CalendarDate(eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate())
    const parsedTime = new Time(eventDate.getHours(), eventDate.getMinutes())

    form.value = {
      title: event.title || '',
      description: event.description || '',
      details: event.details || '',
      date: parsedDate,
      time: parsedTime,
      format: event.format || 'in-person',
      type: event.type || 'meetup',
      location: event.location || '',
      speakers: Array.isArray(event.speakers) ? event.speakers.join(', ') : '',
      status: event.status
    }
  } catch (err: any) {
    if (err.statusCode === 404) throw err
    console.error('Failed to fetch event:', err)
  } finally {
    loading.value = false
  }
}

async function saveEvent() {
  if (!user.value || !form.value.title || !form.value.date) return

  saving.value = true
  try {
    // Convert CalendarDate + Time back to ISO string
    const d = form.value.date
    const t = form.value.time
    const dateStr = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
    const timeStr = `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:00`
    const eventDate = new Date(`${dateStr}T${timeStr}+03:00`).toISOString()

    const { error } = await client
      .from('events')
      .update({
        title: form.value.title,
        description: form.value.description,
        details: form.value.details,
        date: eventDate,
        format: form.value.format,
        type: form.value.type,
        location: form.value.location || null,
        speakers: form.value.speakers ? form.value.speakers.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (error) throw error
    saved.value = true

    // Redirect back to event after short delay
    setTimeout(() => navigateTo(`/events/${eventId}`), 1500)
  } catch (err) {
    console.error('Failed to update event:', err)
    alert('Failed to save changes. Please try again.')
  } finally {
    saving.value = false
  }
}

// Wait for auth then fetch
watch(
  () => authLoading.value,
  (isLoading) => {
    if (!isLoading) {
      if (!isAuthenticated.value) {
        navigateTo('/events')
      } else {
        fetchEvent()
      }
    }
  },
  { immediate: true }
)

useSeoMeta({
  title: 'Edit Event — Bahrain.js',
  description: 'Edit your event submission.'
})
</script>

<template>
  <UContainer class="py-16 max-w-2xl mx-auto">
    <NuxtLink
      :to="`/events/${eventId}`"
      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-yellow-500 transition-colors mb-8"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      Back to event
    </NuxtLink>

    <!-- Loading -->
    <div
      v-if="loading"
      class="space-y-4"
    >
      <USkeleton class="h-12 w-64" />
      <USkeleton class="h-8 w-full" />
      <USkeleton class="h-8 w-3/4" />
    </div>

    <!-- Success state -->
    <UCard
      v-else-if="saved"
      class="text-center"
    >
      <div class="space-y-4 py-8">
        <UIcon
          name="i-lucide-check-circle"
          class="size-16 text-green-500 mx-auto"
        />
        <h2 class="text-xl font-semibold">
          Changes Saved!
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400">
          Redirecting back to the event...
        </p>
      </div>
    </UCard>

    <!-- Edit form -->
    <template v-else-if="canEdit">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-extrabold tracking-tight">
          Edit Event
        </h1>
        <UBadge
          v-if="form.status"
          :color="form.status === 'approved' ? 'success' : form.status === 'pending' ? 'warning' : 'neutral'"
          variant="subtle"
          class="capitalize"
        >
          {{ form.status }}
        </UBadge>
      </div>

      <UCard>
        <form
          class="space-y-6"
          @submit.prevent="saveEvent"
        >
          <UFormField
            label="Event Title"
            required
          >
            <UInput
              v-model="form.title"
              placeholder="e.g. Bahrain.js March Meetup"
              required
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Short Description"
            required
          >
            <UTextarea
              v-model="form.description"
              placeholder="One-line summary of the event"
              required
              :rows="2"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Event Type"
            required
          >
            <USelect
              v-model="form.type"
              :items="types"
              :ui="{ content: 'min-w-fit' }"
            />
          </UFormField>

          <div class="grid sm:grid-cols-2 gap-4">
            <UFormField
              label="Date"
              required
            >
              <UInputDate
                v-model="form.date"
                locale="en-GB"
                required
              >
                <template #leading>
                  <UPopover>
                    <UButton
                      color="primary"
                      variant="link"
                      size="sm"
                      icon="i-lucide-calendar"
                      aria-label="Select a date"
                      class="px-0"
                    />
                    <template #content>
                      <UCalendar v-model="form.date" />
                    </template>
                  </UPopover>
                </template>
              </UInputDate>
            </UFormField>

            <UFormField label="Time">
              <UInputTime
                v-model="form.time"
              >
                <template #leading>
                  <UPopover>
                    <UButton
                      color="primary"
                      variant="link"
                      size="sm"
                      icon="i-lucide-clock"
                      aria-label="Select a time"
                      class="px-0"
                    />
                    <template #content>
                      <div class="max-h-64 overflow-y-auto py-1 px-1 w-fit flex-col">
                        <UButton
                          v-for="slot in timeSlots"
                          :key="slot.label"
                          :color="form.time?.hour === slot.hour && form.time?.minute === slot.minute ? 'primary' : 'neutral'"
                          :variant="form.time?.hour === slot.hour && form.time?.minute === slot.minute ? 'solid' : 'link'"
                          class="flex justify-center"
                          @click="form.time = new Time(slot.hour, slot.minute)"
                        >
                          {{ slot.label }}
                        </UButton>
                      </div>
                    </template>
                  </UPopover>
                </template>
              </UInputTime>
            </UFormField>
          </div>

          <UFormField
            label="Format"
            required
          >
            <USelect
              v-model="form.format"
              :items="formats"
              :ui="{ content: 'min-w-fit' }"
            />
          </UFormField>

          <UFormField label="Location">
            <UInput
              v-model="form.location"
              placeholder="e.g. WeWork, Bahrain Bay"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Speakers (comma separated)">
            <UInput
              v-model="form.speakers"
              placeholder="e.g. John Doe, Jane Smith"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Details">
            <UTextarea
              v-model="form.details"
              placeholder="Full event details, agenda, what to bring, etc."
              :rows="10"
              class="w-full"
            />
          </UFormField>

          <div class="flex items-center gap-4">
            <UButton
              type="submit"
              label="Save Changes"
              icon="i-lucide-save"
              :loading="saving"
              :disabled="!form.title || !form.date"
            />
            <UButton
              :to="`/events/${eventId}`"
              label="Cancel"
              variant="outline"
              color="neutral"
            />
          </div>
        </form>
      </UCard>
    </template>
  </UContainer>
</template>
