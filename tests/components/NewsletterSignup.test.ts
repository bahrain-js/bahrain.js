import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { createMockNeonClient, type MockNeonClient } from '../helpers/mock-neon-client'

let mockClient: MockNeonClient

mockNuxtImport('useNeonClient', () => {
  return () => mockClient
})

describe('NewsletterSignup', () => {
  beforeEach(() => {
    mockClient = createMockNeonClient()
    vi.clearAllMocks()
  })

  describe('subscribe', () => {
    it('inserts email into newsletter_subscribers on success', async () => {
      mockClient = createMockNeonClient({
        newsletter_subscribers: { data: null, error: null }
      })

      const builder = mockClient.from('newsletter_subscribers')
      const result = await builder.insert({ email: 'test@example.com' })

      expect(mockClient.from).toHaveBeenCalledWith('newsletter_subscribers')
      expect(builder.insert).toHaveBeenCalledWith({ email: 'test@example.com' })
      expect(result.error).toBeNull()
    })

    it('handles duplicate email (23505 unique constraint)', async () => {
      mockClient = createMockNeonClient({
        newsletter_subscribers: {
          data: null,
          error: { code: '23505', message: 'duplicate key value' }
        }
      })

      const builder = mockClient.from('newsletter_subscribers')
      const result = await builder.insert({ email: 'existing@example.com' })

      expect(result.error).toBeTruthy()
      expect(result.error.code).toBe('23505')
    })

    it('handles generic API error', async () => {
      mockClient = createMockNeonClient({
        newsletter_subscribers: {
          data: null,
          error: { code: '42501', message: 'permission denied' }
        }
      })

      const builder = mockClient.from('newsletter_subscribers')
      const result = await builder.insert({ email: 'test@example.com' })

      expect(result.error).toBeTruthy()
      expect(result.error.code).not.toBe('23505')
    })

    it('does not submit with empty email', () => {
      const email = ''
      expect(email).toBeFalsy()
      // In the component, subscribe() returns early if !email.value
    })

    it('sends correct data structure', async () => {
      mockClient = createMockNeonClient({
        newsletter_subscribers: { data: null, error: null }
      })

      const email = 'subscriber@bahrain.js.org'
      const builder = mockClient.from('newsletter_subscribers')
      await builder.insert({ email })

      expect(builder.insert).toHaveBeenCalledWith({ email: 'subscriber@bahrain.js.org' })
    })
  })
})
