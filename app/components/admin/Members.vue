<script setup lang="ts">
import type { Member, MemberRole } from '~/types'

defineProps<{
  members: Member[]
  roles: { label: string, value: MemberRole }[]
  roleBadgeColor: Record<MemberRole, 'primary' | 'success' | 'info' | 'neutral'>
  savingId: string | null
  currentUserId: string | undefined
}>()

const emit = defineEmits<{
  'change-role': [member: Member, newRole: MemberRole]
  'delete-member': [member: Member]
}>()
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <h2 class="text-lg font-semibold">
        Members
      </h2>

      <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
        >
          <!-- Avatar + Info -->
          <UAvatar
            :src="member.avatar_url"
            :alt="member.display_name"
            size="md"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">
              {{ member.display_name }}
            </p>
            <a
              :href="`https://github.com/${member.github_username}`"
              target="_blank"
              class="text-sm text-muted hover:text-default transition-colors"
            >
              @{{ member.github_username }}
            </a>
          </div>

          <!-- Current Role Badge -->
          <UBadge
            :color="roleBadgeColor[member.role] || 'neutral'"
            variant="subtle"
            size="sm"
          >
            {{ roles.find(r => r.value === member.role)?.label || member.role }}
          </UBadge>

          <!-- Role Selector -->
          <USelect
            :model-value="member.role"
            :items="roles"
            :disabled="savingId === member.id"
            class="w-40"
            @update:model-value="(val: string) => emit('change-role', member, val as MemberRole)"
          />

          <!-- Delete -->
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :disabled="savingId === member.id || member.user_id === currentUserId"
            :loading="savingId === member.id"
            @click="emit('delete-member', member)"
          />
        </div>
      </div>

      <!-- Empty -->
      <UEmpty
        v-if="!members.length"
        icon="i-lucide-users"
        title="No members"
        description="No community members found."
      />
    </div>
  </UCard>
</template>
