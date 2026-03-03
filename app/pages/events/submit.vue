<script setup lang="ts">
import { Time } from '@internationalized/date'

const { user, isAuthenticated, loading: authLoading, signInWithGitHub } = useAuth()
const client = useNeonClient()

const saving = ref(false)
const saved = ref(false)

const form = ref({
  title: '',
  description: '',
  details: '',
  date: null as any,
  time: new Time(18, 0) as any,
  format: 'in-person',
  type: 'meetup',
  location: ''
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



async function submitEvent() {
  if (!user.value || !form.value.title || !form.value.date) return

  saving.value = true
  try {
    // Convert CalendarDate + Time to ISO string
    const d = form.value.date
    const t = form.value.time
    const dateStr = `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
    const timeStr = `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}:00`
    const eventDate = new Date(`${dateStr}T${timeStr}+03:00`).toISOString()

    const { error } = await client
      .from('events')
      .insert({
        title: form.value.title,
        description: form.value.description,
        details: form.value.details,
        date: eventDate,
        format: form.value.format,
        type: form.value.type,
        location: form.value.location || null,
        status: 'pending',
        submitted_by: user.value.id
      })

    if (error) throw error
    saved.value = true
  } catch (err) {
    console.error('Failed to submit event:', err)
    alert('Failed to submit event. Please try again.')
  } finally {
    saving.value = false
  }
}

useSeoMeta({
  title: 'Submit Event — Bahrain.js',
  description: 'Submit an event for the Bahrain.js community.'
})
</script>

<template>
  <UContainer class="py-16 max-w-2xl mx-auto">
    <NuxtLink
      to="/events"
      class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-yellow-500 transition-colors mb-8"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      Back to events
    </NuxtLink>

    <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
      Submit an Event
    </h1>
    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400 mb-8">
      Propose an event for the Bahrain.js community. Core team members will review your submission.
    </p>

    <!-- Auth required -->
    <UCard
      v-if="!authLoading && !isAuthenticated"
      class="text-center"
    >
      <div class="space-y-4 py-8">
        <UIcon
          name="i-lucide-lock"
          class="size-12 text-zinc-400 mx-auto"
        />
        <h2 class="text-xl font-semibold">
          Sign in to submit an event
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
          You need a GitHub account to propose events for the community.
        </p>
        <UButton
          icon="i-simple-icons-github"
          label="Sign in with GitHub"
          color="neutral"
          size="lg"
          @click="signInWithGitHub"
        />
      </div>
    </UCard>

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
          Event Submitted!
        </h2>
        <p class="text-zinc-500 dark:text-zinc-400">
          Your event has been submitted for review. The core team will approve it shortly.
        </p>
        <UButton
          to="/events"
          label="Back to Events"
          icon="i-lucide-arrow-left"
          variant="outline"
        />
      </div>
    </UCard>

    <!-- Form -->
    <UCard v-else>
      <form
        class="space-y-6"
        @submit.prevent="submitEvent"
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
            label="Submit for Review"
            icon="i-lucide-send"
            :loading="saving"
            :disabled="!form.title || !form.date"
          />
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Events are published after core team approval.
          </p>
        </div>
      </form>
    </UCard>
  </UContainer>
</template>
