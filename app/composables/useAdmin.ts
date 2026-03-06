export function useAdmin() {
  const { user, isAuthenticated: _isAuthenticated } = useAuth()
  const client = useNeonClient()

  // Check if the current user is a core team member (admin)
  const currentUserRole = useState<string | null>('admin-role', () => null)
  const adminChecked = useState('admin-checked', () => false)

  const isAdmin = computed(() => currentUserRole.value === 'core')

  async function checkAdminStatus() {
    if (!user.value || adminChecked.value) return

    try {
      const { data } = await client
        .from('members')
        .select('role')
        .eq('user_id', user.value.id)
        .limit(1)

      currentUserRole.value = data?.[0]?.role || null
    } catch {
      currentUserRole.value = null
    } finally {
      adminChecked.value = true
    }
  }

  // Update a member's role
  async function updateMemberRole(memberId: string, newRole: string) {
    const { error } = await client
      .from('members')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', memberId)

    if (error) throw error
  }

  // Remove a member from both public.members and neon_auth.user.
  // Deleting from neon_auth.user cascades to account/session, preventing
  // the user from logging back in and triggering auto-recreation via
  // ensureMemberProfile.
  async function removeMember(memberId: string) {
    // 1. Look up the user_id before deleting the members row
    const { data: memberData } = await client
      .from('members')
      .select('user_id')
      .eq('id', memberId)
      .limit(1)

    const userId = memberData?.[0]?.user_id
    if (!userId) throw new Error('Member not found')

    // 2. Delete from public.members
    const { error } = await client
      .from('members')
      .delete()
      .eq('id', memberId)
    if (error) throw error

    // 3. Delete from neon_auth.user via Better Auth admin API
    //    This cascades to account, session, and member tables in neon_auth.
    const config = useRuntimeConfig()
    const authUrl = config.public.neonAuthUrl
    if (authUrl) {
      try {
        const res = await fetch(`${authUrl}/admin/remove-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId })
        })
        if (!res.ok) {
          console.warn('[admin] Failed to remove auth user:', res.status, await res.text())
        }
      } catch (err) {
        // Log but don't block — the public.members row is already deleted
        console.warn('[admin] Could not reach auth API to remove user:', err)
      }
    }
  }

  // Auto-check admin status when user data is available
  if (import.meta.client) {
    watch(() => user.value, (u) => {
      if (u) checkAdminStatus()
    }, { immediate: true })
  }

  return {
    isAdmin,
    adminChecked: readonly(adminChecked),
    updateMemberRole,
    removeMember,
    checkAdminStatus
  }
}
