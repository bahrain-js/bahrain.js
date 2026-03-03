export function useAdmin() {
  const { user, isAuthenticated } = useAuth()
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

  // Remove a member
  async function removeMember(memberId: string) {
    const { error } = await client
      .from('members')
      .delete()
      .eq('id', memberId)

    if (error) throw error
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
