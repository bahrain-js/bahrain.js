export function useAuth() {
  const client = useNeonClient()
  const user = useState<any | null>('auth-user', () => null)
  const session = useState<any | null>('auth-session', () => null)
  const loading = useState('auth-loading', () => true)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchSession() {
    loading.value = true
    try {
      const { data } = await client.auth.getSession()
      if (data?.session) {
        session.value = data.session
        user.value = data.user
      } else {
        session.value = null
        user.value = null
      }
    } catch {
      session.value = null
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function signInWithGitHub() {
    const config = useRuntimeConfig()
    const baseURL = config.app.baseURL || '/'
    await client.auth.signIn.social({
      provider: 'github',
      callbackURL: window.location.origin + baseURL + 'people'
    })
  }

  async function signOut() {
    try {
      await client.auth.signOut()
    } catch {
      // Even if the API call fails, clear local state
    }
    session.value = null
    user.value = null
    await navigateTo('/')
  }

  // Fetch session on first use (client-side only)
  if (import.meta.client && loading.value) {
    fetchSession()
  }

  return {
    user: readonly(user),
    session: readonly(session),
    isAuthenticated,
    loading: readonly(loading),
    signInWithGitHub,
    signOut,
    fetchSession
  }
}
