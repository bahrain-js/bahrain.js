import { createClient } from '@neondatabase/neon-js'

let _client: ReturnType<typeof createClient> | null = null

export function useNeonClient() {
  const config = useRuntimeConfig()
  const authUrl = config.public.neonAuthUrl
  const dataUrl = config.public.neonDataApiUrl

  // Only cache the singleton if config URLs are populated.
  // During SSG prerendering, these may be empty — avoid caching a broken client.
  if (_client && authUrl && dataUrl) return _client

  const client = createClient({
    auth: {
      url: authUrl,
      allowAnonymous: true
    },
    dataApi: {
      url: dataUrl,
      options: {
        db: {
          schema: 'public'
        }
      }
    }
  })

  if (authUrl && dataUrl) {
    _client = client
  }

  return client
}

/**
 * Clear the cached Neon client singleton.
 * Must be called on sign-out to prevent stale auth state
 * (tokens, session cookies) from persisting in the reused client.
 */
export function resetNeonClient() {
  _client = null
}
