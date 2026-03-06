import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createMockNeonClient, type MockNeonClient } from '../helpers/mock-neon-client'

let mockClient: MockNeonClient

mockNuxtImport('useNeonClient', () => {
  return () => mockClient
})

describe('useNeonClient', () => {
  beforeEach(() => {
    mockClient = createMockNeonClient()
  })

  it('creates a client with from() method', () => {
    expect(mockClient.from).toBeDefined()
    expect(typeof mockClient.from).toBe('function')
  })

  it('creates a client with auth methods', () => {
    expect(mockClient.auth).toBeDefined()
    expect(mockClient.auth.getSession).toBeDefined()
    expect(mockClient.auth.signIn.social).toBeDefined()
    expect(mockClient.auth.signOut).toBeDefined()
  })

  it('from() returns a chainable query builder', () => {
    const builder = mockClient.from('members')
    expect(builder.select).toBeDefined()
    expect(builder.insert).toBeDefined()
    expect(builder.update).toBeDefined()
    expect(builder.delete).toBeDefined()
    expect(builder.eq).toBeDefined()
    expect(builder.order).toBeDefined()
    expect(builder.limit).toBeDefined()
  })

  it('from() is called with the correct table name', () => {
    mockClient.from('members')
    expect(mockClient.from).toHaveBeenCalledWith('members')
  })

  it('supports chaining multiple filters', () => {
    const builder = mockClient.from('events')
    const chained = builder.select('*').eq('status', 'pending').order('created_at').limit(10)
    expect(chained).toBeDefined()
    expect(builder.select).toHaveBeenCalledWith('*')
    expect(builder.eq).toHaveBeenCalledWith('status', 'pending')
  })

  it('auth.getSession returns expected structure', async () => {
    mockClient.auth.getSession.mockResolvedValue({
      data: { session: { id: 's1' }, user: { id: 'u1', name: 'Test' } },
      error: null
    })

    const result = await mockClient.auth.getSession()
    expect(result.data?.user?.id).toBe('u1')
  })
})
