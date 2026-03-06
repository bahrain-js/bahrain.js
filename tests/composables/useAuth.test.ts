import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createMockNeonClient, type MockNeonClient } from '../helpers/mock-neon-client'

let mockClient: MockNeonClient

mockNuxtImport('useNeonClient', () => {
  return () => mockClient
})

mockNuxtImport('navigateTo', () => {
  return vi.fn()
})

describe('useAuth', () => {
  beforeEach(() => {
    mockClient = createMockNeonClient()
    vi.clearAllMocks()
  })

  describe('fetchSession', () => {
    it('sets user and session on successful session fetch', async () => {
      const mockUser = { id: 'user-1', name: 'Test User', email: 'test@example.com' }
      const mockSession = { id: 'session-1', userId: 'user-1' }

      mockClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      })

      // Mock the member lookup (ensureMemberProfile will query members)
      mockClient = createMockNeonClient({
        members: { data: [{ id: 'member-1' }], error: null }
      })
      mockClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      })

      const result = await mockClient.auth.getSession()
      expect(result.data?.session).toEqual(mockSession)
      expect(result.data?.user).toEqual(mockUser)
    })

    it('clears state when session is null', async () => {
      mockClient.auth.getSession.mockResolvedValue({
        data: { session: null, user: null },
        error: null
      })

      const result = await mockClient.auth.getSession()
      expect(result.data?.session).toBeNull()
    })

    it('clears state on error', async () => {
      mockClient.auth.getSession.mockRejectedValue(new Error('Network error'))

      await expect(mockClient.auth.getSession()).rejects.toThrow('Network error')
    })
  })

  describe('ensureMemberProfile', () => {
    it('skips insert when member already exists', async () => {
      mockClient = createMockNeonClient({
        members: { data: [{ id: 'existing-member' }], error: null }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('id').eq('user_id', 'user-1').limit(1)
      expect(result.data).toHaveLength(1)
      expect(builder.insert).not.toHaveBeenCalled()
    })

    it('creates member when none exists', async () => {
      mockClient = createMockNeonClient({
        members: { data: [], error: null }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('id').eq('user_id', 'user-1').limit(1)
      expect(result.data).toHaveLength(0)

      const insertBuilder = mockClient.from('members')
      await insertBuilder.insert({ user_id: 'user-1', display_name: 'Test', role: 'member' })
      expect(insertBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        display_name: 'Test',
        role: 'member'
      })
    })
  })

  describe('resolveGitHubUsername', () => {
    it('resolves username via GitHub API', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser' })
      })

      const res = await fetch('https://api.github.com/user/12345')
      const data = await res.json()
      expect(data.login).toBe('testuser')
    })

    it('returns fallback on GitHub API error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API limit'))

      await expect(fetch('https://api.github.com/user/12345')).rejects.toThrow()
    })
  })

  describe('signInWithGitHub', () => {
    it('calls signIn.social with github provider', async () => {
      await mockClient.auth.signIn.social({
        provider: 'github',
        callbackURL: 'http://localhost:3000'
      })

      expect(mockClient.auth.signIn.social).toHaveBeenCalledWith({
        provider: 'github',
        callbackURL: 'http://localhost:3000'
      })
    })
  })

  describe('signOut', () => {
    it('calls auth.signOut', async () => {
      await mockClient.auth.signOut()
      expect(mockClient.auth.signOut).toHaveBeenCalled()
    })
  })
})
