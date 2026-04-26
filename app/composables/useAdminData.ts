import type {
  Member,
  MemberRole,
  CommunityEvent,
  JobListing,
  OssOpportunity,
  StartupIdea,
  Project
} from '~/types'
import { ROLE_OPTIONS, ROLE_BADGE_COLOR, STATUS_BADGE_COLOR } from '~/types'

/**
 * Composable for admin panel CRUD operations.
 * Provides state management and actions for all admin-managed entities.
 */
export function useAdminData() {
  const { user } = useAuth()
  const { updateMemberRole, removeMember, isFounder } = useAdmin()
  const client = useNeonClient()
  const toast = useToast()

  // ─── State ───────────────────────────────────────────────────────
  const members = ref<Member[]>([])
  const pendingEvents = ref<CommunityEvent[]>([])
  const jobListings = ref<JobListing[]>([])
  const ossListings = ref<OssOpportunity[]>([])
  const startupIdeas = ref<StartupIdea[]>([])
  const projectListings = ref<Project[]>([])
  const loading = ref(true)
  const savingId = ref<string | null>(null)
  const eventActionId = ref<string | null>(null)
  const oppActionId = ref<string | null>(null)

  // ─── Fetch ───────────────────────────────────────────────────────
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
      console.error('[admin] Failed to load members:', err)
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
        // Enrich events with submitter info
        const submitterIds = [...new Set(
          data.filter((e: CommunityEvent) => e.submitted_by).map((e: CommunityEvent) => e.submitted_by)
        )]
        let memberMap = new Map<string, Pick<Member, 'user_id' | 'display_name' | 'github_username'>>()
        if (submitterIds.length) {
          const { data: memberData } = await client
            .from('members')
            .select('user_id, display_name, github_username')
            .in('user_id', submitterIds)
          memberMap = new Map((memberData || []).map((m: Pick<Member, 'user_id' | 'display_name' | 'github_username'>) => [m.user_id, m]))
        }
        pendingEvents.value = data.map((e: CommunityEvent) => ({
          ...e,
          submitter: memberMap.get(e.submitted_by!) || null
        }))
      } else {
        pendingEvents.value = []
      }
    } catch (err) {
      console.error('[admin] Failed to load events:', err)
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
      console.error('[admin] Failed to load jobs:', err)
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
      console.error('[admin] Failed to load OSS:', err)
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
      console.error('[admin] Failed to load startup ideas:', err)
      startupIdeas.value = []
    }
  }

  async function fetchProjectListings() {
    try {
      const { data, error } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      projectListings.value = data || []
    } catch (err) {
      console.error('[admin] Failed to load projects:', err)
      projectListings.value = []
    }
  }

  async function fetchAll() {
    loading.value = true
    await Promise.all([
      fetchMembers(),
      fetchPendingEvents(),
      fetchJobListings(),
      fetchOssListings(),
      fetchStartupIdeas(),
      fetchProjectListings()
    ])
    loading.value = false
  }

  // ─── Members CRUD ────────────────────────────────────────────────
  async function changeRole(member: Member, newRole: MemberRole) {
    // Non-founders cannot change the role of core team members
    if (member.role === 'core' && !isFounder.value) {
      toast.add({ title: 'Permission denied', description: 'Only the founder can change a Core Team member\'s role.', color: 'warning', icon: 'i-lucide-shield-alert' })
      return
    }

    // Warn if demoting yourself
    if (member.user_id === user.value?.id && newRole !== 'core') {
      if (!confirm('You are about to remove your own admin privileges. Are you sure?')) return
    }

    savingId.value = member.id
    try {
      await updateMemberRole(member.id, newRole)
      member.role = newRole
    } catch (err) {
      console.error('[admin] Failed to update role:', err)
      toast.add({ title: 'Failed to update role', description: 'Please try again.', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      savingId.value = null
    }
  }

  async function deleteMember(member: Member) {
    const isSelf = member.user_id === user.value?.id

    // Founder account can never be deleted — by anyone
    if (member.founder) {
      toast.add({ title: 'Cannot delete founder', description: 'The founder account cannot be deleted.', color: 'warning', icon: 'i-lucide-shield-alert' })
      return
    }

    // Non-founders cannot delete other core team members
    if (member.role === 'core' && !isSelf && !isFounder.value) {
      toast.add({ title: 'Permission denied', description: 'Only the founder can remove a Core Team member.', color: 'warning', icon: 'i-lucide-shield-alert' })
      return
    }

    // Self-deletion: double confirmation
    if (isSelf) {
      if (!confirm('You are about to permanently delete your own account. This will remove your profile and revoke access.')) return
      if (!confirm('This action cannot be undone. Are you absolutely sure?')) return
    } else {
      if (!confirm(`Remove ${member.display_name} (@${member.github_username}) from the community?`)) return
    }

    savingId.value = member.id
    try {
      await removeMember(member.id)
      members.value = members.value.filter(m => m.id !== member.id)
    } catch (err) {
      console.error('[admin] Failed to remove member:', err)
      toast.add({ title: 'Failed to remove member', description: 'Please try again.', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      savingId.value = null
    }
  }

  // ─── Events CRUD ─────────────────────────────────────────────────
  async function updateEventStatus(event: CommunityEvent, status: string) {
    eventActionId.value = event.id
    try {
      const { error } = await client
        .from('events')
        .update({ status, reviewed_by: user.value?.id, updated_at: new Date().toISOString() })
        .eq('id', event.id)
      if (error) throw error
      event.status = status as CommunityEvent['status']
      event.reviewed_by = user.value?.id ?? null
    } catch (err) {
      console.error('[admin] Failed to update event:', err)
      toast.add({ title: 'Failed to update event', description: 'Please try again.', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      eventActionId.value = null
    }
  }

  async function deleteEvent(event: CommunityEvent) {
    if (!confirm(`Delete event "${event.title}"?`)) return

    eventActionId.value = event.id
    try {
      const { error } = await client.from('events').delete().eq('id', event.id)
      if (error) throw error
      pendingEvents.value = pendingEvents.value.filter(e => e.id !== event.id)
    } catch (err) {
      console.error('[admin] Failed to delete event:', err)
      toast.add({ title: 'Failed to delete event', description: 'Please try again.', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      eventActionId.value = null
    }
  }

  // ─── Jobs CRUD ───────────────────────────────────────────────────
  async function createJob(formData: {
    title: string
    company: string
    description: string
    location: string
    url: string
    salary_range: string
    is_remote: boolean
    tags: string[]
  }) {
    try {
      const { error } = await client.from('opportunities').insert({
        title: formData.title,
        company: formData.company || null,
        description: formData.description || null,
        location: formData.location || null,
        url: formData.url || null,
        salary_range: formData.salary_range || null,
        is_remote: formData.is_remote,
        tags: formData.tags || [],
        status: 'approved'
      })
      if (error) throw error
      await fetchJobListings()
    } catch (err) {
      console.error('[admin] Failed to create job:', err)
      toast.add({ title: 'Failed to create job listing', color: 'error', icon: 'i-lucide-circle-x' })
    }
  }

  async function deleteJob(job: JobListing) {
    if (!confirm(`Delete "${job.title}"?`)) return
    oppActionId.value = job.id
    try {
      const { error } = await client.from('opportunities').delete().eq('id', job.id)
      if (error) throw error
      jobListings.value = jobListings.value.filter(j => j.id !== job.id)
    } catch (err) {
      console.error('[admin] Failed to delete job:', err)
      toast.add({ title: 'Failed to delete', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  async function updateJobStatus(job: JobListing, newStatus: string) {
    if (job.status === newStatus) return
    oppActionId.value = job.id
    try {
      const { error } = await client.from('opportunities').update({ status: newStatus }).eq('id', job.id)
      if (error) throw error
      job.status = newStatus
    } catch (err) {
      console.error('[admin] Failed to update job status:', err)
    } finally {
      oppActionId.value = null
    }
  }

  // ─── OSS CRUD ────────────────────────────────────────────────────
  async function createOss(formData: {
    project_name: string
    description: string
    difficulty: string
    issues_label: string
    url: string
    tags: string[]
  }) {
    try {
      const { error } = await client.from('open_source_opportunities').insert({
        project_name: formData.project_name,
        description: formData.description || null,
        difficulty: formData.difficulty,
        issues_label: formData.issues_label || null,
        url: formData.url || null,
        tags: formData.tags || [],
        status: 'active'
      })
      if (error) throw error
      await fetchOssListings()
    } catch (err) {
      console.error('[admin] Failed to create OSS:', err)
      toast.add({ title: 'Failed to create project', color: 'error', icon: 'i-lucide-circle-x' })
    }
  }

  async function deleteOss(opp: OssOpportunity) {
    if (!confirm(`Delete "${opp.project_name}"?`)) return
    oppActionId.value = opp.id
    try {
      const { error } = await client.from('open_source_opportunities').delete().eq('id', opp.id)
      if (error) throw error
      ossListings.value = ossListings.value.filter(o => o.id !== opp.id)
    } catch (err) {
      console.error('[admin] Failed to delete OSS:', err)
      toast.add({ title: 'Failed to delete', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  async function updateOssStatus(opp: OssOpportunity, newStatus: string) {
    if (opp.status === newStatus) return
    oppActionId.value = opp.id
    try {
      const { error } = await client.from('open_source_opportunities').update({ status: newStatus }).eq('id', opp.id)
      if (error) throw error
      opp.status = newStatus
    } catch (err) {
      console.error('[admin] Failed to update OSS status:', err)
    } finally {
      oppActionId.value = null
    }
  }

  async function updateOss(id: string, formData: {
    project_name: string
    description: string
    difficulty: string
    issues_label: string
    url: string
    tags: string[]
  }) {
    oppActionId.value = id
    try {
      const { error } = await client
        .from('open_source_opportunities')
        .update({
          project_name: formData.project_name,
          description: formData.description || null,
          difficulty: formData.difficulty,
          issues_label: formData.issues_label || null,
          url: formData.url || null,
          tags: formData.tags || []
        })
        .eq('id', id)
      if (error) throw error
      const idx = ossListings.value.findIndex(o => o.id === id)
      if (idx !== -1) {
        Object.assign(ossListings.value[idx]!, formData)
      }
    } catch (err) {
      console.error('[admin] Failed to update OSS:', err)
      toast.add({ title: 'Failed to update project', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  // ─── Ideas CRUD ──────────────────────────────────────────────────
  async function createIdea(formData: {
    title: string
    problem: string
    description: string
    looking_for: string
    sector: string
    contact_url: string
    tags: string[]
  }) {
    try {
      const { error } = await client.from('startup_ideas').insert({
        title: formData.title,
        problem: formData.problem || null,
        description: formData.description || null,
        looking_for: formData.looking_for,
        sector: formData.sector || null,
        contact_url: formData.contact_url || null,
        tags: formData.tags || [],
        status: 'approved'
      })
      if (error) throw error
      await fetchStartupIdeas()
    } catch (err) {
      console.error('[admin] Failed to create idea:', err)
      toast.add({ title: 'Failed to create startup idea', color: 'error', icon: 'i-lucide-circle-x' })
    }
  }

  async function deleteIdea(idea: StartupIdea) {
    if (!confirm(`Delete "${idea.title}"?`)) return
    oppActionId.value = idea.id
    try {
      const { error } = await client.from('startup_ideas').delete().eq('id', idea.id)
      if (error) throw error
      startupIdeas.value = startupIdeas.value.filter(i => i.id !== idea.id)
    } catch (err) {
      console.error('[admin] Failed to delete idea:', err)
      toast.add({ title: 'Failed to delete', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  async function updateIdeaStatus(idea: StartupIdea, newStatus: string) {
    if (idea.status === newStatus) return
    oppActionId.value = idea.id
    try {
      const { error } = await client.from('startup_ideas').update({ status: newStatus }).eq('id', idea.id)
      if (error) throw error
      idea.status = newStatus
    } catch (err) {
      console.error('[admin] Failed to update idea status:', err)
    } finally {
      oppActionId.value = null
    }
  }

  async function updateIdea(id: string, formData: {
    title: string
    problem: string
    description: string
    looking_for: string
    sector: string
    contact_url: string
    tags: string[]
  }) {
    oppActionId.value = id
    try {
      const { error } = await client
        .from('startup_ideas')
        .update({
          title: formData.title,
          problem: formData.problem || null,
          description: formData.description || null,
          looking_for: formData.looking_for,
          sector: formData.sector || null,
          contact_url: formData.contact_url || null,
          tags: formData.tags || []
        })
        .eq('id', id)
      if (error) throw error
      const idx = startupIdeas.value.findIndex(i => i.id === id)
      if (idx !== -1) {
        Object.assign(startupIdeas.value[idx]!, formData)
      }
    } catch (err) {
      console.error('[admin] Failed to update idea:', err)
      toast.add({ title: 'Failed to update startup idea', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  // ─── Projects CRUD ───────────────────────────────────────────────
  async function createProject(formData: {
    name: string
    slug: string
    description: string
    stack: string[]
    stage: string
    featured: boolean
    start_here: boolean
    npm_package: string
    url: string
  }) {
    try {
      const { error } = await client.from('projects').insert({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        stack: formData.stack || [],
        stage: formData.stage,
        featured: formData.featured,
        start_here: formData.start_here,
        npm_package: formData.npm_package || null,
        url: formData.url || null,
        status: 'active'
      })
      if (error) throw error
      await fetchProjectListings()
    } catch (err) {
      console.error('[admin] Failed to create project:', err)
      toast.add({ title: 'Failed to create project', color: 'error', icon: 'i-lucide-circle-x' })
    }
  }

  async function deleteProject(project: Project) {
    if (!confirm(`Delete "${project.name}"?`)) return
    oppActionId.value = project.id
    try {
      const { error } = await client.from('projects').delete().eq('id', project.id)
      if (error) throw error
      projectListings.value = projectListings.value.filter(p => p.id !== project.id)
    } catch (err) {
      console.error('[admin] Failed to delete project:', err)
      toast.add({ title: 'Failed to delete', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  async function updateProjectStatus(project: Project, newStatus: string) {
    if (project.status === newStatus) return
    oppActionId.value = project.id
    try {
      const { error } = await client
        .from('projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', project.id)
      if (error) throw error
      project.status = newStatus
    } catch (err) {
      console.error('[admin] Failed to update project status:', err)
    } finally {
      oppActionId.value = null
    }
  }

  async function updateProject(id: string, formData: {
    name: string
    slug: string
    description: string
    stack: string[]
    stage: string
    featured: boolean
    start_here: boolean
    npm_package: string
    url: string
  }) {
    oppActionId.value = id
    try {
      const { error } = await client
        .from('projects')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          stack: formData.stack || [],
          stage: formData.stage,
          featured: formData.featured,
          start_here: formData.start_here,
          npm_package: formData.npm_package || null,
          url: formData.url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      if (error) throw error
      const idx = projectListings.value.findIndex(p => p.id === id)
      if (idx !== -1) {
        Object.assign(projectListings.value[idx]!, { ...formData, updated_at: new Date().toISOString() })
      }
    } catch (err) {
      console.error('[admin] Failed to update project:', err)
      toast.add({ title: 'Failed to update project', color: 'error', icon: 'i-lucide-circle-x' })
    } finally {
      oppActionId.value = null
    }
  }

  // ─── Utility ─────────────────────────────────────────────────────
  function formatEventDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return {
    // Auth context
    isFounder,
    // State
    members,
    pendingEvents,
    jobListings,
    ossListings,
    startupIdeas,
    projectListings,
    loading,
    savingId,
    eventActionId,
    oppActionId,
    // Constants
    roles: ROLE_OPTIONS,
    roleBadgeColor: ROLE_BADGE_COLOR,
    statusBadgeColor: STATUS_BADGE_COLOR,
    // Actions
    fetchAll,
    changeRole,
    deleteMember,
    updateEventStatus,
    deleteEvent,
    createJob,
    deleteJob,
    updateJobStatus,
    createOss,
    deleteOss,
    updateOssStatus,
    updateOss,
    createIdea,
    deleteIdea,
    updateIdeaStatus,
    updateIdea,
    createProject,
    deleteProject,
    updateProjectStatus,
    updateProject,
    formatEventDate
  }
}
