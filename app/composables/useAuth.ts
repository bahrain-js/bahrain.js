import type { AuthUser, AuthSession, Member } from '~/types'

export function useAuth() {
  const client = useNeonClient()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const session = useState<AuthSession | null>('auth-session', () => null)
  const loading = useState('auth-loading', () => true)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchSession() {
    loading.value = true
    try {
      const { data } = await client.auth.getSession()
      if (data?.session) {
        session.value = data.session
        user.value = data.user
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

  /**
   * Extract the GitHub username from the user's avatar URL by resolving
   * the numeric GitHub user ID via the public GitHub API.
   */
  async function resolveGitHubUsername(authUser: AuthUser): Promise<string> {
    const avatarMatch = authUser.image?.match(/avatars\.githubusercontent\.com\/u\/(\d+)/)
    if (avatarMatch?.[1]) {
      try {
        const res = await fetch(`https://api.github.com/user/${avatarMatch[1]}`)
        if (res.ok) {
          const ghUser = await res.json()
          if (ghUser.login) return ghUser.login
        }
      } catch {
        // Fall through to fallback
      }
    }
    return authUser.username || authUser.name || ''
  }

  /**
   * On first sign-in, auto-create a minimal members row so the user
   * immediately appears on the People page. Then redirect to /profile
   * so they can fill in details like bio and skills.
   */
  async function ensureMemberProfile(authUser: AuthUser) {
    if (!authUser?.id) return

    try {
      const { data } = await client
        .from('members')
        .select('id')
        .eq('user_id', authUser.id)
        .limit(1)

      if (data?.length) return

      const ghUsername = await resolveGitHubUsername(authUser)

      const newMember: Partial<Member> = {
        user_id: authUser.id,
        display_name: authUser.name || authUser.email?.split('@')[0] || 'New Member',
        github_username: ghUsername,
        avatar_url: authUser.image || '',
        role: 'member',
      }

      await client.from('members').insert(newMember)
      await navigateTo('/profile')
    } catch (err) {
      console.error('[useAuth] Failed to auto-create member profile:', err)
    }
  }

  async function signInWithGitHub() {
    await client.auth.signIn.social({
      provider: 'github',
      callbackURL: window.location.href,
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
    fetchSession,
  }
}
