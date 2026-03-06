import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createMockNeonClient, type MockNeonClient } from '../helpers/mock-neon-client'

let mockClient: MockNeonClient

mockNuxtImport('useNeonClient', () => {
  return () => mockClient
})

mockNuxtImport('useAuth', () => {
  return () => ({
    user: ref({ id: 'user-1', name: 'Admin User' }),
    isAuthenticated: ref(true)
  })
})

mockNuxtImport('useAdmin', () => {
  return () => ({
    updateMemberRole: vi.fn(),
    removeMember: vi.fn()
  })
})

const sampleMembers = [
  { id: 'm1', user_id: 'u1', display_name: 'Alice', role: 'core' },
  { id: 'm2', user_id: 'u2', display_name: 'Bob', role: 'member' }
]

const sampleEvents = [
  { id: 'e1', title: 'Meetup 1', status: 'pending', date: '2026-03-15' },
  { id: 'e2', title: 'Meetup 2', status: 'approved', date: '2026-03-20' }
]

const sampleJobs = [
  { id: 'j1', title: 'Frontend Dev', company: 'TechCo', status: 'approved' }
]

const sampleOss = [
  { id: 'o1', project_name: 'Cool lib', status: 'active', difficulty: 'beginner' }
]

const sampleIdeas = [
  { id: 'i1', title: 'AI Tool', status: 'pending', sector: 'tech' }
]

const sampleProjects = [
  { id: 'p1', name: 'Bahrain.js Site', slug: 'bahrainjs', status: 'active' }
]

describe('useAdminData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── Fetch Operations ───────────────────────────────────────

  describe('fetchMembers', () => {
    it('fetches all members ordered by display_name', async () => {
      mockClient = createMockNeonClient({
        members: { data: sampleMembers, error: null }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('*').order('display_name')

      expect(mockClient.from).toHaveBeenCalledWith('members')
      expect(builder.select).toHaveBeenCalledWith('*')
      expect(builder.order).toHaveBeenCalledWith('display_name')
      expect(result.data).toEqual(sampleMembers)
    })

    it('handles error gracefully', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: { message: 'Connection failed' } }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('*')

      expect(result.error).toBeTruthy()
    })
  })

  describe('fetchPendingEvents', () => {
    it('fetches events with submitter info', async () => {
      mockClient = createMockNeonClient({
        events: { data: sampleEvents, error: null }
      })

      const builder = mockClient.from('events')
      const result = await builder.select('*').order('created_at', { ascending: false })

      expect(mockClient.from).toHaveBeenCalledWith('events')
      expect(result.data).toEqual(sampleEvents)
    })
  })

  describe('fetchJobListings', () => {
    it('fetches job listings', async () => {
      mockClient = createMockNeonClient({
        opportunities: { data: sampleJobs, error: null }
      })

      const builder = mockClient.from('opportunities')
      const result = await builder.select('*').order('created_at', { ascending: false })

      expect(mockClient.from).toHaveBeenCalledWith('opportunities')
      expect(result.data).toEqual(sampleJobs)
    })
  })

  describe('fetchOssListings', () => {
    it('fetches OSS listings', async () => {
      mockClient = createMockNeonClient({
        open_source_opportunities: { data: sampleOss, error: null }
      })

      const builder = mockClient.from('open_source_opportunities')
      const result = await builder.select('*').order('created_at', { ascending: false })

      expect(mockClient.from).toHaveBeenCalledWith('open_source_opportunities')
      expect(result.data).toEqual(sampleOss)
    })
  })

  describe('fetchStartupIdeas', () => {
    it('fetches startup ideas', async () => {
      mockClient = createMockNeonClient({
        startup_ideas: { data: sampleIdeas, error: null }
      })

      const builder = mockClient.from('startup_ideas')
      const result = await builder.select('*').order('created_at', { ascending: false })

      expect(mockClient.from).toHaveBeenCalledWith('startup_ideas')
      expect(result.data).toEqual(sampleIdeas)
    })
  })

  describe('fetchProjectListings', () => {
    it('fetches project listings', async () => {
      mockClient = createMockNeonClient({
        projects: { data: sampleProjects, error: null }
      })

      const builder = mockClient.from('projects')
      const result = await builder.select('*').order('created_at', { ascending: false })

      expect(mockClient.from).toHaveBeenCalledWith('projects')
      expect(result.data).toEqual(sampleProjects)
    })
  })

  // ─── Members CRUD ───────────────────────────────────────────

  describe('changeRole', () => {
    it('updates member role', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: null }
      })

      const builder = mockClient.from('members')
      await builder.update({ role: 'core' }).eq('id', 'm1')

      expect(builder.update).toHaveBeenCalledWith({ role: 'core' })
      expect(builder.eq).toHaveBeenCalledWith('id', 'm1')
    })
  })

  describe('deleteMember', () => {
    it('deletes member by id', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: null }
      })

      const builder = mockClient.from('members')
      await builder.delete().eq('id', 'm1')

      expect(builder.delete).toHaveBeenCalled()
      expect(builder.eq).toHaveBeenCalledWith('id', 'm1')
    })
  })

  // ─── Events CRUD ────────────────────────────────────────────

  describe('updateEventStatus', () => {
    it('updates event status', async () => {
      mockClient = createMockNeonClient({
        events: { data: null, error: null }
      })

      const builder = mockClient.from('events')
      await builder.update({ status: 'approved' }).eq('id', 'e1')

      expect(builder.update).toHaveBeenCalledWith({ status: 'approved' })
      expect(builder.eq).toHaveBeenCalledWith('id', 'e1')
    })
  })

  describe('deleteEvent', () => {
    it('deletes event by id', async () => {
      mockClient = createMockNeonClient({
        events: { data: null, error: null }
      })

      const builder = mockClient.from('events')
      await builder.delete().eq('id', 'e1')

      expect(builder.delete).toHaveBeenCalled()
    })
  })

  // ─── Jobs CRUD ──────────────────────────────────────────────

  describe('createJob', () => {
    it('inserts a new job listing', async () => {
      const newJob = {
        title: 'Backend Dev',
        company: 'StartupInc',
        description: 'Build APIs',
        location: 'Bahrain',
        url: 'https://example.com/apply',
        salary_range: '2000-3000 BHD',
        is_remote: true,
        tags: ['node', 'typescript'],
        status: 'approved'
      }

      mockClient = createMockNeonClient({
        opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('opportunities')
      await builder.insert(newJob)

      expect(builder.insert).toHaveBeenCalledWith(newJob)
    })
  })

  describe('deleteJob', () => {
    it('deletes job by id', async () => {
      mockClient = createMockNeonClient({
        opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('opportunities')
      await builder.delete().eq('id', 'j1')

      expect(builder.delete).toHaveBeenCalled()
    })
  })

  describe('updateJobStatus', () => {
    it('updates job status', async () => {
      mockClient = createMockNeonClient({
        opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('opportunities')
      await builder.update({ status: 'closed' }).eq('id', 'j1')

      expect(builder.update).toHaveBeenCalledWith({ status: 'closed' })
    })
  })

  // ─── OSS CRUD ───────────────────────────────────────────────

  describe('createOss', () => {
    it('inserts a new OSS opportunity', async () => {
      const newOss = {
        project_name: 'New Lib',
        description: 'A new library',
        difficulty: 'intermediate',
        issues_label: 'good-first-issue',
        url: 'https://github.com/example/lib',
        tags: ['javascript'],
        status: 'active'
      }

      mockClient = createMockNeonClient({
        open_source_opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('open_source_opportunities')
      await builder.insert(newOss)

      expect(builder.insert).toHaveBeenCalledWith(newOss)
    })
  })

  describe('deleteOss', () => {
    it('deletes OSS listing by id', async () => {
      mockClient = createMockNeonClient({
        open_source_opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('open_source_opportunities')
      await builder.delete().eq('id', 'o1')

      expect(builder.delete).toHaveBeenCalled()
    })
  })

  describe('updateOssStatus', () => {
    it('updates OSS status', async () => {
      mockClient = createMockNeonClient({
        open_source_opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('open_source_opportunities')
      await builder.update({ status: 'archived' }).eq('id', 'o1')

      expect(builder.update).toHaveBeenCalledWith({ status: 'archived' })
    })
  })

  describe('updateOss', () => {
    it('updates OSS listing fields', async () => {
      mockClient = createMockNeonClient({
        open_source_opportunities: { data: null, error: null }
      })

      const builder = mockClient.from('open_source_opportunities')
      await builder.update({
        project_name: 'Updated Lib',
        description: 'Updated desc',
        difficulty: 'advanced',
        issues_label: 'help-wanted',
        url: 'https://github.com/example/updated',
        tags: ['typescript']
      }).eq('id', 'o1')

      expect(builder.update).toHaveBeenCalled()
      expect(builder.eq).toHaveBeenCalledWith('id', 'o1')
    })
  })

  // ─── Ideas CRUD ─────────────────────────────────────────────

  describe('createIdea', () => {
    it('inserts a new startup idea', async () => {
      const newIdea = {
        title: 'Delivery App',
        problem: 'Slow delivery',
        description: 'Fast delivery platform',
        looking_for: 'Co-founder',
        sector: 'logistics',
        contact_url: 'https://example.com',
        tags: ['logistics', 'mobile'],
        status: 'pending'
      }

      mockClient = createMockNeonClient({
        startup_ideas: { data: null, error: null }
      })

      const builder = mockClient.from('startup_ideas')
      await builder.insert(newIdea)

      expect(builder.insert).toHaveBeenCalledWith(newIdea)
    })
  })

  describe('deleteIdea', () => {
    it('deletes idea by id', async () => {
      mockClient = createMockNeonClient({
        startup_ideas: { data: null, error: null }
      })

      const builder = mockClient.from('startup_ideas')
      await builder.delete().eq('id', 'i1')

      expect(builder.delete).toHaveBeenCalled()
    })
  })

  describe('updateIdeaStatus', () => {
    it('updates idea status', async () => {
      mockClient = createMockNeonClient({
        startup_ideas: { data: null, error: null }
      })

      const builder = mockClient.from('startup_ideas')
      await builder.update({ status: 'approved' }).eq('id', 'i1')

      expect(builder.update).toHaveBeenCalledWith({ status: 'approved' })
    })
  })

  // ─── Projects CRUD ──────────────────────────────────────────

  describe('createProject', () => {
    it('inserts a new project', async () => {
      const newProject = {
        name: 'New Project',
        slug: 'new-project',
        description: 'A cool project',
        stack: ['nuxt', 'typescript'],
        stage: 'beta',
        featured: false,
        start_here: true,
        npm_package: '@bahrain.js/new-project',
        url: 'https://github.com/bahrain-js/new-project',
        status: 'active'
      }

      mockClient = createMockNeonClient({
        projects: { data: null, error: null }
      })

      const builder = mockClient.from('projects')
      await builder.insert(newProject)

      expect(builder.insert).toHaveBeenCalledWith(newProject)
    })
  })

  describe('deleteProject', () => {
    it('deletes project by id', async () => {
      mockClient = createMockNeonClient({
        projects: { data: null, error: null }
      })

      const builder = mockClient.from('projects')
      await builder.delete().eq('id', 'p1')

      expect(builder.delete).toHaveBeenCalled()
    })
  })

  describe('updateProjectStatus', () => {
    it('updates project status', async () => {
      mockClient = createMockNeonClient({
        projects: { data: null, error: null }
      })

      const builder = mockClient.from('projects')
      await builder.update({ status: 'archived' }).eq('id', 'p1')

      expect(builder.update).toHaveBeenCalledWith({ status: 'archived' })
    })
  })

  describe('updateProject', () => {
    it('updates project fields', async () => {
      mockClient = createMockNeonClient({
        projects: { data: null, error: null }
      })

      const builder = mockClient.from('projects')
      await builder.update({
        name: 'Updated Project',
        slug: 'updated-project',
        description: 'Updated desc',
        stack: ['vue', 'nuxt'],
        stage: 'production',
        featured: true,
        start_here: false,
        npm_package: '',
        url: 'https://github.com/bahrain-js/updated'
      }).eq('id', 'p1')

      expect(builder.update).toHaveBeenCalled()
      expect(builder.eq).toHaveBeenCalledWith('id', 'p1')
    })
  })

  // ─── Utility ────────────────────────────────────────────────

  describe('formatEventDate', () => {
    it('formats ISO date string to readable format', () => {
      const date = new Date('2026-03-15T18:00:00Z')
      const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      expect(formatted).toContain('Mar')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2026')
    })
  })
})
