<script setup lang="ts">
import type { CommunityEvent } from '~/types'

defineProps<{
  events: CommunityEvent[]
  statusBadgeColor: Record<string, 'warning' | 'success' | 'error' | 'neutral'>
  eventActionId: string | null
}>()

const emit = defineEmits<{
  'update-status': [event: CommunityEvent, status: string]
  'delete-event': [event: CommunityEvent]
}>()

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">
        Events
      </h2>

      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div
          v-for="event in events"
          :key="event.id"
          class="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
        >
          <!-- Event info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <NuxtLink
                :to="`/events/${event.id}`"
                class="font-medium hover:text-yellow-500 transition-colors truncate"
              >
                {{ event.title }}
              </NuxtLink>
              <UBadge
                :color="statusBadgeColor[event.status] || 'neutral'"
                variant="subtle"
                size="xs"
              >
                {{ event.status }}
              </UBadge>
            </div>
            <p class="text-sm text-muted truncate">
              {{ event.description }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-xs text-muted">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-calendar"
                  class="size-3"
                />
                {{ formatEventDate(event.date) }}
              </span>
              <span
                v-if="event.submitter"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-user"
                  class="size-3"
                />
                {{ event.submitter.display_name || event.submitter.github_username }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-lucide-tag"
                  class="size-3"
                />
                {{ event.type }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <UButton
              :to="`/events/${event.id}/edit`"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="xs"
            />
            <UButton
              v-if="event.status === 'pending'"
              label="Approve"
              icon="i-lucide-check"
              color="success"
              variant="soft"
              size="xs"
              :loading="eventActionId === event.id"
              @click="emit('update-status', event, 'approved')"
            />
            <UButton
              v-if="event.status === 'pending'"
              label="Reject"
              icon="i-lucide-x"
              color="error"
              variant="soft"
              size="xs"
              :loading="eventActionId === event.id"
              @click="emit('update-status', event, 'rejected')"
            />
            <UButton
              v-if="event.status === 'rejected'"
              label="Approve"
              icon="i-lucide-check"
              color="success"
              variant="soft"
              size="xs"
              :loading="eventActionId === event.id"
              @click="emit('update-status', event, 'approved')"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="xs"
              :loading="eventActionId === event.id"
              @click="emit('delete-event', event)"
            />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <UEmpty
        v-if="!events.length"
        icon="i-lucide-calendar"
        title="No events"
        description="No events have been submitted yet."
      />
    </div>
  </UCard>
</template>
