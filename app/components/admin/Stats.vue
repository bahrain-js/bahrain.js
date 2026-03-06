<script setup lang="ts">
import type { Member, CommunityEvent } from '~/types'

defineProps<{
  members: Member[]
  pendingEvents: CommunityEvent[]
}>()</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <UCard>
      <div class="text-center">
        <p class="text-2xl font-bold">
          {{ members.length }}
        </p>
        <p class="text-sm text-muted">
          Total Members
        </p>
      </div>
    </UCard>
    <UCard>
      <div class="text-center">
        <p class="text-2xl font-bold">
          {{ members.filter(m => m.role === 'core').length }}
        </p>
        <p class="text-sm text-muted">
          Core Team
        </p>
      </div>
    </UCard>
    <UCard>
      <div class="text-center">
        <p class="text-2xl font-bold">
          {{ pendingEvents.filter(e => e.status === 'approved').length }}
        </p>
        <p class="text-sm text-muted">
          Events
        </p>
      </div>
    </UCard>
    <UCard>
      <div class="text-center">
        <p class="text-2xl font-bold text-yellow-500">
          {{ pendingEvents.filter(e => e.status === 'pending').length }}
        </p>
        <p class="text-sm text-muted">
          Pending Review
        </p>
      </div>
    </UCard>
  </div>
</template>
