<script setup lang="ts">
import type { Member, MemberRole } from '~/types'

const props = defineProps<{
  members: Member[]
  roles: { label: string, value: MemberRole }[]
  roleBadgeColor: Record<MemberRole, 'primary' | 'success' | 'info' | 'neutral'>
  savingId: string | null
  currentUserId: string | undefined
  isFounder: boolean
}>()

const emit = defineEmits<{
  'change-role': [member: Member, newRole: MemberRole]
  'delete-member': [member: Member]
}>()

/**
 * Whether the role selector should be disabled for a given member.
 * Non-founders cannot change core team members' roles.
 */
function isRoleDisabled(member: Member) {
  if (props.savingId === member.id) return true
  if (member.role === 'core' && !props.isFounder) return true
  return false
}

/**
 * Whether the delete button should be disabled for a given member.
 * - Founder members can never be deleted
 * - Non-founders cannot delete other core members (but can delete themselves)
 */
function isDeleteDisabled(member: Member) {
  if (props.savingId === member.id) return true
  if (member.founder) return true
  if (member.role === 'core' && member.user_id !== props.currentUserId && !props.isFounder) return true
  return false
}
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
              <UBadge
                v-if="member.founder"
                color="warning"
                variant="subtle"
                size="xs"
                class="ml-1.5 align-middle"
              >
                <UIcon name="i-lucide-shield" class="size-3 mr-0.5" />
                Founder
              </UBadge>
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
          <UTooltip
            v-if="isRoleDisabled(member) && member.role === 'core' && !isFounder"
            text="Only the founder can change Core Team roles"
          >
            <USelect
              :model-value="member.role"
              :items="roles"
              disabled
              class="w-40"
            />
          </UTooltip>
          <USelect
            v-else
            :model-value="member.role"
            :items="roles"
            :disabled="isRoleDisabled(member)"
            class="w-40"
            @update:model-value="(val: string) => emit('change-role', member, val as MemberRole)"
          />

          <!-- Delete -->
          <UTooltip
            v-if="member.founder"
            text="Founder account cannot be deleted"
          >
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              disabled
            />
          </UTooltip>
          <UButton
            v-else
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            size="sm"
            :disabled="isDeleteDisabled(member)"
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
