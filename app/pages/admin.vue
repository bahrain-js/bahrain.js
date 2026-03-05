<script setup lang="ts">
const { isAuthenticated, user, loading: authLoading } = useAuth()
const { isAdmin, adminChecked } = useAdmin()

const {
  members, pendingEvents, jobListings, ossListings, startupIdeas,
  loading, savingId, eventActionId, oppActionId,
  roles, roleBadgeColor, statusBadgeColor,
  fetchAll,
  changeRole, deleteMember,
  updateEventStatus, deleteEvent,
  createJob, deleteJob, updateJobStatus,
  createOss, deleteOss, updateOssStatus, updateOss,
  createIdea, deleteIdea, updateIdeaStatus
} = useAdminData()

const activeTab = ref('members')

// Redirect non-admins
watch(
  [() => authLoading.value, () => adminChecked.value],
  ([isLoading, checked]) => {
    if (!isLoading && checked) {
      if (!isAuthenticated.value || !isAdmin.value) {
        navigateTo('/people')
      }
    }
  },
  { immediate: true }
)

onMounted(fetchAll)

useSeoMeta({
  title: 'Admin — Bahrain.js',
  description: 'Manage community members, events, opportunities, and roles.'
})
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
        Admin
      </h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
        Manage community members, events, opportunities, and roles.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="authLoading || !adminChecked || loading"
      class="space-y-4"
    >
      <USkeleton
        v-for="i in 5"
        :key="i"
        class="h-16 rounded-lg"
      />
    </div>

    <!-- Not authorized -->
    <UCard
      v-else-if="!isAdmin"
      class="text-center"
    >
      <div class="space-y-4">
        <UIcon
          name="i-lucide-shield-x"
          class="text-4xl text-red-400"
        />
        <h2 class="text-lg font-semibold">
          Access Denied
        </h2>
        <p class="text-muted">
          Only Core Team members can access admin features.
        </p>
        <UButton
          to="/people"
          label="Back to People"
          variant="outline"
        />
      </div>
    </UCard>

    <!-- Admin Panel -->
    <template v-else>
      <AdminStats
        :members="members"
        :pending-events="pendingEvents"
      />

      <!-- Tabs -->
      <div class="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <UButton
          label="Members"
          icon="i-lucide-users"
          :variant="activeTab === 'members' ? 'soft' : 'ghost'"
          @click="activeTab = 'members'"
        />
        <UButton
          label="Events"
          icon="i-lucide-calendar"
          :variant="activeTab === 'events' ? 'soft' : 'ghost'"
          @click="activeTab = 'events'"
        >
          <template
            v-if="pendingEvents.filter(e => e.status === 'pending').length"
            #trailing
          >
            <UBadge
              :label="String(pendingEvents.filter(e => e.status === 'pending').length)"
              color="warning"
              size="xs"
              variant="solid"
              class="rounded-full"
            />
          </template>
        </UButton>
        <UButton
          label="Opportunities"
          icon="i-lucide-briefcase"
          :variant="activeTab === 'opportunities' ? 'soft' : 'ghost'"
          @click="activeTab = 'opportunities'"
        />
      </div>

      <!-- Members Tab -->
      <AdminMembers
        v-if="activeTab === 'members'"
        :members="members"
        :roles="roles"
        :role-badge-color="roleBadgeColor"
        :saving-id="savingId"
        :current-user-id="user?.id"
        @change-role="changeRole"
        @delete-member="deleteMember"
      />

      <!-- Events Tab -->
      <AdminEvents
        v-if="activeTab === 'events'"
        :events="pendingEvents"
        :status-badge-color="statusBadgeColor"
        :event-action-id="eventActionId"
        @update-status="updateEventStatus"
        @delete-event="deleteEvent"
      />

      <!-- Opportunities Tab -->
      <div
        v-if="activeTab === 'opportunities'"
        class="space-y-6"
      >
        <AdminJobs
          :jobs="jobListings"
          :status-badge-color="statusBadgeColor"
          :opp-action-id="oppActionId"
          @update-status="updateJobStatus"
          @delete-job="deleteJob"
          @create="createJob"
        />

        <AdminOss
          :listings="ossListings"
          :opp-action-id="oppActionId"
          @update-status="updateOssStatus"
          @delete-oss="deleteOss"
          @create="createOss"
          @edit="updateOss"
        />

        <AdminIdeas
          :ideas="startupIdeas"
          :status-badge-color="statusBadgeColor"
          :opp-action-id="oppActionId"
          @update-status="updateIdeaStatus"
          @delete-idea="deleteIdea"
          @create="createIdea"
        />
      </div>
    </template>
  </UContainer>
</template>
