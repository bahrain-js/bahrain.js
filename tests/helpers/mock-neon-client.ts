import { vi } from 'vitest'

/**
 * Creates a chainable mock that mimics the Neon PostgREST client API.
 * Each method returns `this` for chaining, except terminal methods
 * (select, insert, update, delete) which resolve to `{ data, error }`.
 */
export function createMockQueryBuilder(resolvedValue: { data?: unknown, error?: unknown } = { data: [], error: null }) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {}

  const chainMethods = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'is', 'in', 'order', 'limit', 'single', 'range', 'contains', 'schema']
  const terminalMethods = ['select', 'insert', 'update', 'delete']

  // Chain methods return the builder
  for (const method of chainMethods) {
    builder[method] = vi.fn().mockReturnValue(builder)
  }

  // Terminal methods also return the builder (for further chaining like .select() after .insert())
  // but the final resolved value is the configured result
  for (const method of terminalMethods) {
    builder[method] = vi.fn().mockReturnValue(builder)
  }

  // When awaited, resolve to the configured value
  builder.then = vi.fn().mockImplementation((resolve: (value: unknown) => void) => {
    resolve(resolvedValue)
    return builder
  })

  return builder
}

/**
 * Creates a full mock Neon client with configurable per-table responses.
 */
export function createMockNeonClient(tableResponses: Record<string, { data?: unknown, error?: unknown }> = {}) {
  const defaultResponse = { data: [], error: null }

  const mockClient = {
    from: vi.fn().mockImplementation((table: string) => {
      const response = tableResponses[table] || defaultResponse
      return createMockQueryBuilder(response)
    }),
    schema: vi.fn().mockReturnThis(),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: null, error: null }),
      signIn: {
        social: vi.fn().mockResolvedValue({ data: null, error: null }),
        email: vi.fn().mockResolvedValue({ data: null, error: null })
      },
      signUp: {
        email: vi.fn().mockResolvedValue({ data: null, error: null })
      },
      signOut: vi.fn().mockResolvedValue({ data: null, error: null })
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null })
  }

  return mockClient
}

export type MockNeonClient = ReturnType<typeof createMockNeonClient>
