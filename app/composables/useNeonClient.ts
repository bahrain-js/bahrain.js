import { createClient } from '@neondatabase/neon-js'

let _client: ReturnType<typeof createClient> | null = null

export function useNeonClient() {
  if (_client) return _client

  const config = useRuntimeConfig()

  _client = createClient({
    auth: {
      url: config.public.neonAuthUrl,
      allowAnonymous: true
    },
    dataApi: {
      url: config.public.neonDataApiUrl
    }
  })

  return _client
}
