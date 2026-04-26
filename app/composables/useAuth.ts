import type { AuthUser, AuthSession, Member } from '~/types'
import { resolveGitHubUsername } from '~/utils/github'
import { resetNeonClient } from '~/composables/useNeonClient'

export function useAuth() {
  const client = useNeonClient()
  const user = useState<AuthUser | null>('auth-user', () => null)
  const session = useState<AuthSession | null>('auth-session', () => null)
  const loading = useState('auth-loading', () => true)

  /**
   * Guards against running ensureMemberProfile more than once per session.
   * Set to true after the first successful check/insert so subsequent
   * page navigations skip the DB round-trip entirely.
   */
  const memberProfileChecked = useState('member-profile-checked', () => false)

  /**
   * True when the user has just signed up (first-ever session).
   * Used by the caller to redirect new members to /profile.
   */
  const isNewMember = useState('is-new-member', () => false)

  const isAuthenticated = computed(() => !!user.value)

  async function fetchSession() {
    loading.value = true
    try {
      const { data } = await client.auth.getSession()
      if (data?.session) {
        session.value = data.session
        user.value = data.user
        const newUser = await ensureMemberProfile(data.user)
        if (newUser) {
          isNewMember.value = true
          await navigateTo('/profile')
        }
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
   * On first sign-in, auto-create a minimal members row so the user
   * immediately appears on the People page.
   *
   * Returns `true` if a new member was created (first sign-in),
   * `false` if the member already existed or the check was skipped.
   */
  async function ensureMemberProfile(authUser: AuthUser): Promise<boolean> {
    if (!authUser?.id) return false

    // Skip if already checked this session
    if (memberProfileChecked.value) return false

    try {
      const { data } = await client
        .from('members')
        .select('id')
        .eq('user_id', authUser.id)
        .limit(1)

      memberProfileChecked.value = true

      if (data?.length) return false

      const ghUsername = await resolveGitHubUsername(authUser)

      const newMember: Partial<Member> = {
        user_id: authUser.id,
        display_name: authUser.name || authUser.email?.split('@')[0] || 'New Member',
        github_username: ghUsername,
        avatar_url: authUser.image || '',
        role: 'member'
      }

      await client.from('members').insert(newMember)
      return true
    } catch (err) {
      console.error('[useAuth] Failed to auto-create member profile:', err)
      return false
    }
  }

  async function signInWithGitHub() {
    const { siteUrl } = useRuntimeConfig().public
    const callbackURL = siteUrl ? `${siteUrl}${window.location.pathname}` : window.location.href
    await client.auth.signIn.social({
      provider: 'github',
      callbackURL
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
    memberProfileChecked.value = false
    isNewMember.value = false
    resetNeonClient()
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
    isNewMember: readonly(isNewMember),
    signInWithGitHub,
    signOut,
    fetchSession
  }
}
