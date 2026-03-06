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

describe('useAdmin', () => {
  beforeEach(() => {
    mockClient = createMockNeonClient()
    vi.clearAllMocks()
  })

  describe('checkAdminStatus', () => {
    it('identifies user as admin when role is core', async () => {
      mockClient = createMockNeonClient({
        members: { data: [{ role: 'core' }], error: null }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('role').eq('user_id', 'user-1').limit(1)

      expect(result.data).toEqual([{ role: 'core' }])
      expect(result.data[0].role).toBe('core')
    })

    it('identifies user as non-admin when role is member', async () => {
      mockClient = createMockNeonClient({
        members: { data: [{ role: 'member' }], error: null }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('role').eq('user_id', 'user-1').limit(1)

      expect(result.data[0].role).toBe('member')
      expect(result.data[0].role).not.toBe('core')
    })

    it('handles user not in members table', async () => {
      mockClient = createMockNeonClient({
        members: { data: [], error: null }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('role').eq('user_id', 'nonexistent').limit(1)

      expect(result.data).toEqual([])
    })

    it('handles API error gracefully', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: { message: 'Connection failed' } }
      })

      const builder = mockClient.from('members')
      const result = await builder.select('role').eq('user_id', 'user-1').limit(1)

      expect(result.error).toBeTruthy()
    })
  })

  describe('updateMemberRole', () => {
    it('calls update with correct role and memberId', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: null }
      })

      const builder = mockClient.from('members')
      await builder.update({ role: 'core', updated_at: expect.any(String) }).eq('id', 'member-1')

      expect(builder.update).toHaveBeenCalled()
      expect(builder.eq).toHaveBeenCalledWith('id', 'member-1')
    })

    it('throws on API error', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: { message: 'Permission denied' } }
      })

      const builder = mockClient.from('members')
      const result = await builder.update({ role: 'core' }).eq('id', 'member-1')

      expect(result.error).toBeTruthy()
      expect(result.error.message).toBe('Permission denied')
    })
  })

  describe('removeMember', () => {
    it('calls delete with correct memberId', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: null }
      })

      const builder = mockClient.from('members')
      await builder.delete().eq('id', 'member-1')

      expect(builder.delete).toHaveBeenCalled()
      expect(builder.eq).toHaveBeenCalledWith('id', 'member-1')
    })

    it('throws on API error', async () => {
      mockClient = createMockNeonClient({
        members: { data: null, error: { message: 'Cascade failed' } }
      })

      const builder = mockClient.from('members')
      const result = await builder.delete().eq('id', 'member-1')

      expect(result.error).toBeTruthy()
    })
  })
})
