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
        // Auto-create member profile if first sign-in
        await ensureMemberProfile(data.user)
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

  // Resolve GitHub username from avatar URL (numeric GitHub user ID)
  async function resolveGitHubUsername(u: any): Promise<string> {
    const avatarMatch = u.image?.match(/avatars\.githubusercontent\.com\/u\/(\d+)/)
    if (avatarMatch?.[1]) {
      try {
        const res = await fetch(`https://api.github.com/user/${avatarMatch[1]}`)
        if (res.ok) {
          const ghUser = await res.json()
          if (ghUser.login) return ghUser.login
        }
      } catch {
        // Fallback below
      }
    }
    return u.username || u.name || ''
  }

  // Auto-create a minimal members row on first sign-in
  async function ensureMemberProfile(u: any) {
    if (!u?.id) return

    try {
      const { data } = await client
        .from('members')
        .select('id')
        .eq('user_id', u.id)
        .limit(1)

      if (data?.length) return // Profile already exists

      // Resolve GitHub username
      const ghUsername = await resolveGitHubUsername(u)

      // Create minimal member record
      await client.from('members').insert({
        user_id: u.id,
        display_name: u.name || u.email?.split('@')[0] || 'New Member',
        github_username: ghUsername,
        avatar_url: u.image || '',
        role: 'member'
      })

      // Redirect to profile page to fill out details
      await navigateTo('/profile')
    } catch (err) {
      console.error('Failed to auto-create member profile:', err)
    }
  }

  async function signInWithGitHub() {
    await client.auth.signIn.social({
      provider: 'github',
      callbackURL: window.location.href
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

