<script setup lang="ts">
const { user, isAuthenticated, loading: authLoading } = useAuth()
const { isAdmin, adminChecked, updateMemberRole, removeMember } = useAdmin()
const client = useNeonClient()

const members = ref<any[]>([])
const pendingEvents = ref<any[]>([])
const jobListings = ref<any[]>([])
const ossListings = ref<any[]>([])
const startupIdeas = ref<any[]>([])
const loading = ref(true)
const savingId = ref<string | null>(null)
const eventActionId = ref<string | null>(null)
const oppActionId = ref<string | null>(null)
const showJobForm = ref(false)
const showOssForm = ref(false)
const showIdeaForm = ref(false)
const jobForm = ref({ title: '', company: '', description: '', location: '', url: '', salary_range: '', is_remote: false, tags: '' })
const ossForm = ref({ project_name: '', description: '', difficulty: 'beginner', issues_label: '', url: '', tags: '' })
const ideaForm = ref({ title: '', problem: '', description: '', looking_for: 'co-founder', sector: '', contact_url: '', tags: '' })

// Tab state
const activeTab = ref('members')

const roles = [
  { label: 'Member', value: 'member' },
  { label: 'Contributor', value: 'contributor' },
  { label: 'Maintainer', value: 'maintainer' },
  { label: 'Core Team', value: 'core' }
]

const roleBadgeColor = {
  core: 'primary' as const,
  maintainer: 'success' as const,
  contributor: 'info' as const,
  member: 'neutral' as const
} as Record<string, 'primary' | 'success' | 'info' | 'neutral'>

const statusBadgeColor = {
  pending: 'warning' as const,
  approved: 'success' as const,
  rejected: 'error' as const,
  draft: 'neutral' as const
} as Record<string, 'warning' | 'success' | 'error' | 'neutral'>

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

async function fetchMembers() {
  try {
    const { data, error } = await client
      .from('members')
      .select('*')
      .order('role', { ascending: true })
      .order('display_name', { ascending: true })

    if (error) throw error
    members.value = data || []
  } catch (err) {
    console.error('Failed to load members:', err)
    members.value = []
  }
}

async function fetchPendingEvents() {
  try {
    const { data, error } = await client
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data?.length) {
      // Lookup submitter info
      const submitterIds = [...new Set(data.filter((e: any) => e.submitted_by).map((e: any) => e.submitted_by))]
      let memberMap = new Map()
      if (submitterIds.length) {
        const { data: memberData } = await client
          .from('members')
          .select('user_id, display_name, github_username')
          .in('user_id', submitterIds)
        memberMap = new Map((memberData || []).map((m: any) => [m.user_id, m]))
      }
      pendingEvents.value = data.map((e: any) => ({
        ...e,
        submitter: memberMap.get(e.submitted_by) || null
      }))
    } else {
      pendingEvents.value = []
    }
  } catch (err) {
    console.error('Failed to load events:', err)
    pendingEvents.value = []
  }
}

async function fetchJobListings() {
  try {
    const { data, error } = await client
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    jobListings.value = data || []
  } catch (err) {
    console.error('Failed to load jobs:', err)
    jobListings.value = []
  }
}

async function fetchOssListings() {
  try {
    const { data, error } = await client
      .from('open_source_opportunities')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    ossListings.value = data || []
  } catch (err) {
    console.error('Failed to load OSS:', err)
    ossListings.value = []
  }
}

async function fetchStartupIdeas() {
  try {
    const { data, error } = await client
      .from('startup_ideas')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    startupIdeas.value = data || []
  } catch (err) {
    console.error('Failed to load startup ideas:', err)
    startupIdeas.value = []
  }
}

async function fetchAll() {
  loading.value = true
  await Promise.all([fetchMembers(), fetchPendingEvents(), fetchJobListings(), fetchOssListings(), fetchStartupIdeas()])
  loading.value = false
}

async function changeRole(member: any, newRole: string) {
  if (member.user_id === user.value?.id && newRole !== 'core') {
    const confirmed = confirm('You are about to remove your own admin privileges. Are you sure?')
    if (!confirmed) return
  }

  savingId.value = member.id
  try {
    await updateMemberRole(member.id, newRole)
    member.role = newRole
  } catch (err) {
    console.error('Failed to update role:', err)
    alert('Failed to update role. Please try again.')
  } finally {
    savingId.value = null
  }
}

async function deleteMember(member: any) {
  if (member.user_id === user.value?.id) {
    alert('You cannot delete your own profile from the admin panel.')
    return
  }

  const confirmed = confirm(`Remove ${member.display_name} (@${member.github_username}) from the community?`)
  if (!confirmed) return

  savingId.value = member.id
  try {
    await removeMember(member.id)
    members.value = members.value.filter(m => m.id !== member.id)
  } catch (err) {
    console.error('Failed to remove member:', err)
    alert('Failed to remove member. Please try again.')
  } finally {
    savingId.value = null
  }
}

async function updateEventStatus(event: any, status: string) {
  eventActionId.value = event.id
  try {
    const { error } = await client
      .from('events')
      .update({ status, reviewed_by: user.value?.id, updated_at: new Date().toISOString() })
      .eq('id', event.id)

    if (error) throw error
    event.status = status
    event.reviewed_by = user.value?.id
  } catch (err) {
    console.error('Failed to update event:', err)
    alert('Failed to update event. Please try again.')
  } finally {
    eventActionId.value = null
  }
}

async function deleteEvent(event: any) {
  const confirmed = confirm(`Delete event "${event.title}"?`)
  if (!confirmed) return

  eventActionId.value = event.id
  try {
    const { error } = await client
      .from('events')
      .delete()
      .eq('id', event.id)

    if (error) throw error
    pendingEvents.value = pendingEvents.value.filter(e => e.id !== event.id)
  } catch (err) {
    console.error('Failed to delete event:', err)
    alert('Failed to delete event. Please try again.')
  } finally {
    eventActionId.value = null
  }
}

async function createJob() {
  try {
    const { error } = await client
      .from('opportunities')
      .insert({
        title: jobForm.value.title,
        company: jobForm.value.company || null,
        description: jobForm.value.description || null,
        location: jobForm.value.location || null,
        url: jobForm.value.url || null,
        salary_range: jobForm.value.salary_range || null,
        is_remote: jobForm.value.is_remote,
        tags: jobForm.value.tags ? jobForm.value.tags.split(',').map((t: string) => t.trim()) : [],
        status: 'approved'
      })
    if (error) throw error
    showJobForm.value = false
    jobForm.value = { title: '', company: '', description: '', location: '', url: '', salary_range: '', is_remote: false, tags: '' }
    await fetchJobListings()
  } catch (err) {
    console.error('Failed to create job:', err)
    alert('Failed to create job listing.')
  }
}

async function deleteJob(job: any) {
  if (!confirm(`Delete job "${job.title}"?`)) return
  oppActionId.value = job.id
  try {
    const { error } = await client.from('opportunities').delete().eq('id', job.id)
    if (error) throw error
    jobListings.value = jobListings.value.filter(j => j.id !== job.id)
  } catch (err) {
    console.error('Failed to delete job:', err)
    alert('Failed to delete.')
  } finally {
    oppActionId.value = null
  }
}

async function toggleJobStatus(job: any) {
  const newStatus = job.status === 'approved' ? 'pending' : 'approved'
  oppActionId.value = job.id
  try {
    const { error } = await client.from('opportunities').update({ status: newStatus }).eq('id', job.id)
    if (error) throw error
    job.status = newStatus
  } catch (err) {
    console.error('Failed to update job status:', err)
  } finally {
    oppActionId.value = null
  }
}

async function createOss() {
  try {
    const { error } = await client
      .from('open_source_opportunities')
      .insert({
        project_name: ossForm.value.project_name,
        description: ossForm.value.description || null,
        difficulty: ossForm.value.difficulty,
        issues_label: ossForm.value.issues_label || null,
        url: ossForm.value.url || null,
        tags: ossForm.value.tags ? ossForm.value.tags.split(',').map((t: string) => t.trim()) : [],
        status: 'active'
      })
    if (error) throw error
    showOssForm.value = false
    ossForm.value = { project_name: '', description: '', difficulty: 'beginner', issues_label: '', url: '', tags: '' }
    await fetchOssListings()
  } catch (err) {
    console.error('Failed to create OSS:', err)
    alert('Failed to create open source opportunity.')
  }
}

async function deleteOss(opp: any) {
  if (!confirm(`Delete "${opp.project_name}"?`)) return
  oppActionId.value = opp.id
  try {
    const { error } = await client.from('open_source_opportunities').delete().eq('id', opp.id)
    if (error) throw error
    ossListings.value = ossListings.value.filter(o => o.id !== opp.id)
  } catch (err) {
    console.error('Failed to delete OSS:', err)
    alert('Failed to delete.')
  } finally {
    oppActionId.value = null
  }
}

async function toggleOssStatus(opp: any) {
  const newStatus = opp.status === 'active' ? 'inactive' : 'active'
  oppActionId.value = opp.id
  try {
    const { error } = await client.from('open_source_opportunities').update({ status: newStatus }).eq('id', opp.id)
    if (error) throw error
    opp.status = newStatus
  } catch (err) {
    console.error('Failed to update OSS status:', err)
  } finally {
    oppActionId.value = null
  }
}

async function createIdea() {
  try {
    const { error } = await client
      .from('startup_ideas')
      .insert({
        title: ideaForm.value.title,
        problem: ideaForm.value.problem || null,
        description: ideaForm.value.description || null,
        looking_for: ideaForm.value.looking_for,
        sector: ideaForm.value.sector || null,
        contact_url: ideaForm.value.contact_url || null,
        tags: ideaForm.value.tags ? ideaForm.value.tags.split(',').map((t: string) => t.trim()) : [],
        status: 'approved'
      })
    if (error) throw error
    showIdeaForm.value = false
    ideaForm.value = { title: '', problem: '', description: '', looking_for: 'co-founder', sector: '', contact_url: '', tags: '' }
    await fetchStartupIdeas()
  } catch (err) {
    console.error('Failed to create idea:', err)
    alert('Failed to create startup idea.')
  }
}

async function deleteIdea(idea: any) {
  if (!confirm(`Delete "${idea.title}"?`)) return
  oppActionId.value = idea.id
  try {
    const { error } = await client.from('startup_ideas').delete().eq('id', idea.id)
    if (error) throw error
    startupIdeas.value = startupIdeas.value.filter(i => i.id !== idea.id)
  } catch (err) {
    console.error('Failed to delete idea:', err)
    alert('Failed to delete.')
  } finally {
    oppActionId.value = null
  }
}

async function toggleIdeaStatus(idea: any) {
  const newStatus = idea.status === 'approved' ? 'pending' : 'approved'
  oppActionId.value = idea.id
  try {
    const { error } = await client.from('startup_ideas').update({ status: newStatus }).eq('id', idea.id)
    if (error) throw error
    idea.status = newStatus
  } catch (err) {
    console.error('Failed to update idea status:', err)
  } finally {
    oppActionId.value = null
  }
}

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

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
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">Admin</h1>
      <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
        Manage community members, events, opportunities, and roles.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="authLoading || !adminChecked || loading" class="space-y-4">
      <USkeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
    </div>

    <!-- Not authorized -->
    <UCard v-else-if="!isAdmin" class="text-center">
      <div class="space-y-4">
        <UIcon name="i-lucide-shield-x" class="text-4xl text-red-400" />
        <h2 class="text-lg font-semibold">Access Denied</h2>
        <p class="text-muted">Only Core Team members can access admin features.</p>
        <UButton to="/people" label="Back to People" variant="outline" />
      </div>
    </UCard>

    <!-- Admin Panel -->
    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard>
          <div class="text-center">
            <p class="text-2xl font-bold">{{ members.length }}</p>
            <p class="text-sm text-muted">Total Members</p>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-2xl font-bold">{{ members.filter(m => m.role === 'core').length }}</p>
            <p class="text-sm text-muted">Core Team</p>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-2xl font-bold">{{ pendingEvents.filter(e => e.status === 'approved').length }}</p>
            <p class="text-sm text-muted">Events</p>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <p class="text-2xl font-bold text-yellow-500">{{ pendingEvents.filter(e => e.status === 'pending').length }}</p>
            <p class="text-sm text-muted">Pending Review</p>
          </div>
        </UCard>
      </div>

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
          <template v-if="pendingEvents.filter(e => e.status === 'pending').length" #trailing>
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
      <UCard v-if="activeTab === 'members'">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold">Members</h2>

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
                <p class="font-medium truncate">{{ member.display_name }}</p>
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
                @update:model-value="(val: string) => changeRole(member, val)"
              />

              <!-- Delete -->
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                :disabled="savingId === member.id || member.user_id === user?.id"
                :loading="savingId === member.id"
                @click="deleteMember(member)"
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

      <!-- Events Tab -->
      <UCard v-if="activeTab === 'events'">
        <div class="space-y-4">
          <h2 class="text-lg font-semibold">Events</h2>

          <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
            <div
              v-for="event in pendingEvents"
              :key="event.id"
              class="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <!-- Event info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <NuxtLink :to="`/events/${event.id}`" class="font-medium hover:text-yellow-500 transition-colors truncate">
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
                <p class="text-sm text-muted truncate">{{ event.description }}</p>
                <div class="flex items-center gap-3 mt-1 text-xs text-muted">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-calendar" class="size-3" />
                    {{ formatEventDate(event.date) }}
                  </span>
                  <span v-if="event.submitter" class="flex items-center gap-1">
                    <UIcon name="i-lucide-user" class="size-3" />
                    {{ event.submitter.display_name || event.submitter.github_username }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-tag" class="size-3" />
                    {{ event.type }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 flex-shrink-0">
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
                  @click="updateEventStatus(event, 'approved')"
                />
                <UButton
                  v-if="event.status === 'pending'"
                  label="Reject"
                  icon="i-lucide-x"
                  color="error"
                  variant="soft"
                  size="xs"
                  :loading="eventActionId === event.id"
                  @click="updateEventStatus(event, 'rejected')"
                />
                <UButton
                  v-if="event.status === 'rejected'"
                  label="Approve"
                  icon="i-lucide-check"
                  color="success"
                  variant="soft"
                  size="xs"
                  :loading="eventActionId === event.id"
                  @click="updateEventStatus(event, 'approved')"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  :loading="eventActionId === event.id"
                  @click="deleteEvent(event)"
                />
              </div>
            </div>
          </div>

          <!-- Empty -->
          <UEmpty
            v-if="!pendingEvents.length"
            icon="i-lucide-calendar"
            title="No events"
            description="No events have been submitted yet."
          />
        </div>
      </UCard>

      <!-- Opportunities Tab -->
      <div v-if="activeTab === 'opportunities'" class="space-y-6">
        <!-- Jobs Section -->
        <UCard>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Job Listings</h2>
              <UButton label="Add Job" icon="i-lucide-plus" size="xs" @click="showJobForm = true" />
            </div>

            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <div v-for="job in jobListings" :key="job.id" class="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium truncate">{{ job.title }}</p>
                    <UBadge :color="statusBadgeColor[job.status] || 'neutral'" variant="subtle" size="xs">
                      {{ job.status }}
                    </UBadge>
                    <UBadge v-if="job.is_remote" color="info" variant="subtle" size="xs">Remote</UBadge>
                  </div>
                  <p v-if="job.company" class="text-sm text-muted">{{ job.company }} <span v-if="job.location">· {{ job.location }}</span></p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    :icon="job.status === 'approved' ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    color="neutral" variant="ghost" size="xs"
                    :loading="oppActionId === job.id"
                    @click="toggleJobStatus(job)"
                  />
                  <UButton
                    icon="i-lucide-trash-2" color="error" variant="ghost" size="xs"
                    :loading="oppActionId === job.id"
                    @click="deleteJob(job)"
                  />
                </div>
              </div>
            </div>

            <UEmpty v-if="!jobListings.length" icon="i-lucide-briefcase" title="No job listings" description="Add the first job listing." />
          </div>
        </UCard>

        <!-- OSS Section -->
        <UCard>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Open Source</h2>
              <UButton label="Add Project" icon="i-lucide-plus" size="xs" @click="showOssForm = true" />
            </div>

            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <div v-for="opp in ossListings" :key="opp.id" class="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium truncate">{{ opp.project_name }}</p>
                    <UBadge :color="opp.status === 'active' ? 'success' : 'neutral'" variant="subtle" size="xs">
                      {{ opp.status }}
                    </UBadge>
                    <UBadge :color="opp.difficulty === 'beginner' ? 'success' : opp.difficulty === 'intermediate' ? 'info' : 'warning'" variant="subtle" size="xs">
                      {{ opp.difficulty }}
                    </UBadge>
                  </div>
                  <p class="text-sm text-muted truncate">{{ opp.description }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    :icon="opp.status === 'active' ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    color="neutral" variant="ghost" size="xs"
                    :loading="oppActionId === opp.id"
                    @click="toggleOssStatus(opp)"
                  />
                  <UButton
                    icon="i-lucide-trash-2" color="error" variant="ghost" size="xs"
                    :loading="oppActionId === opp.id"
                    @click="deleteOss(opp)"
                  />
                </div>
              </div>
            </div>

            <UEmpty v-if="!ossListings.length" icon="i-lucide-git-pull-request" title="No projects" description="Add an open source project." />
          </div>
        </UCard>

        <!-- Startup Ideas Section -->
        <UCard>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Startup Ideas</h2>
              <UButton label="Add Idea" icon="i-lucide-plus" size="xs" @click="showIdeaForm = true" />
            </div>

            <div class="divide-y divide-zinc-200 dark:divide-zinc-800">
              <div v-for="idea in startupIdeas" :key="idea.id" class="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="font-medium truncate">{{ idea.title }}</p>
                    <UBadge :color="statusBadgeColor[idea.status] || 'neutral'" variant="subtle" size="xs">
                      {{ idea.status }}
                    </UBadge>
                    <UBadge color="warning" variant="subtle" size="xs">
                      {{ idea.looking_for }}
                    </UBadge>
                  </div>
                  <p class="text-sm text-muted truncate">{{ idea.sector ? `${idea.sector} · ` : '' }}{{ idea.problem || idea.description }}</p>
                </div>
                <div class="flex items-center gap-1">
                  <UButton
                    :icon="idea.status === 'approved' ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    color="neutral" variant="ghost" size="xs"
                    :loading="oppActionId === idea.id"
                    @click="toggleIdeaStatus(idea)"
                  />
                  <UButton
                    icon="i-lucide-trash-2" color="error" variant="ghost" size="xs"
                    :loading="oppActionId === idea.id"
                    @click="deleteIdea(idea)"
                  />
                </div>
              </div>
            </div>

            <UEmpty v-if="!startupIdeas.length" icon="i-lucide-lightbulb" title="No startup ideas" description="Add a startup idea." />
          </div>
        </UCard>
      </div>

      <!-- Add Job Modal -->
      <UModal v-model:open="showJobForm">
        <template #content>
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-semibold">Add Job Listing</h3>
            <UFormField label="Job Title">
              <UInput v-model="jobForm.title" placeholder="e.g. Senior Frontend Developer" class="w-full" />
            </UFormField>
            <UFormField label="Company">
              <UInput v-model="jobForm.company" placeholder="e.g. Acme Corp" class="w-full" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="jobForm.description" placeholder="Job description..." class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Location">
                <UInput v-model="jobForm.location" placeholder="e.g. Manama, Bahrain" class="w-full" />
              </UFormField>
              <UFormField label="Salary Range">
                <UInput v-model="jobForm.salary_range" placeholder="e.g. $60k-$80k" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="Apply URL">
              <UInput v-model="jobForm.url" placeholder="https://..." class="w-full" />
            </UFormField>
            <UFormField label="Tags (comma separated)">
              <UInput v-model="jobForm.tags" placeholder="Vue, TypeScript, Node.js" class="w-full" />
            </UFormField>
            <UCheckbox v-model="jobForm.is_remote" label="Remote position" />
            <div class="flex justify-end gap-2 pt-2">
              <UButton label="Cancel" variant="outline" @click="showJobForm = false" />
              <UButton label="Create" :disabled="!jobForm.title" @click="createJob" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Add OSS Modal -->
      <UModal v-model:open="showOssForm">
        <template #content>
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-semibold">Add Open Source Project</h3>
            <UFormField label="Project Name">
              <UInput v-model="ossForm.project_name" placeholder="e.g. @bahrainjs/toolkit" class="w-full" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="ossForm.description" placeholder="What the project does..." class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Difficulty">
                <USelect v-model="ossForm.difficulty" :items="['beginner', 'intermediate', 'advanced']" class="w-full" />
              </UFormField>
              <UFormField label="Issues Label">
                <UInput v-model="ossForm.issues_label" placeholder="e.g. Good first issues" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="GitHub URL">
              <UInput v-model="ossForm.url" placeholder="https://github.com/..." class="w-full" />
            </UFormField>
            <UFormField label="Tags (comma separated)">
              <UInput v-model="ossForm.tags" placeholder="Vue, TypeScript" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton label="Cancel" variant="outline" @click="showOssForm = false" />
              <UButton label="Create" :disabled="!ossForm.project_name" @click="createOss" />
            </div>
          </div>
        </template>
      </UModal>

      <!-- Add Idea Modal -->
      <UModal v-model:open="showIdeaForm">
        <template #content>
          <div class="p-6 space-y-4">
            <h3 class="text-lg font-semibold">Add Startup Idea</h3>
            <UFormField label="Title">
              <UInput v-model="ideaForm.title" placeholder="e.g. Local Delivery Platform" class="w-full" />
            </UFormField>
            <UFormField label="Problem Statement">
              <UTextarea v-model="ideaForm.problem" placeholder="What problem does this solve in Bahrain?" class="w-full" />
            </UFormField>
            <UFormField label="Description">
              <UTextarea v-model="ideaForm.description" placeholder="Describe the idea..." class="w-full" />
            </UFormField>
            <div class="grid grid-cols-2 gap-4">
              <UFormField label="Looking For">
                <USelect v-model="ideaForm.looking_for" :items="['co-founder', 'technical co-founder', 'business co-founder', 'founding engineer']" class="w-full" />
              </UFormField>
              <UFormField label="Sector">
                <UInput v-model="ideaForm.sector" placeholder="e.g. Fintech, EdTech" class="w-full" />
              </UFormField>
            </div>
            <UFormField label="Contact URL">
              <UInput v-model="ideaForm.contact_url" placeholder="https://..." class="w-full" />
            </UFormField>
            <UFormField label="Tags (comma separated)">
              <UInput v-model="ideaForm.tags" placeholder="Node.js, API, Mobile" class="w-full" />
            </UFormField>
            <div class="flex justify-end gap-2 pt-2">
              <UButton label="Cancel" variant="outline" @click="showIdeaForm = false" />
              <UButton label="Create" :disabled="!ideaForm.title" @click="createIdea" />
            </div>
          </div>
        </template>
      </UModal>
    </template>
  </UContainer>
</template>
