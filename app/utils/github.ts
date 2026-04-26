import type { AuthUser } from '~/types'

/**
 * Cache of resolved GitHub usernames keyed by numeric GitHub user ID.
 * Prevents duplicate API calls within the same session.
 */
const _usernameCache = new Map<string, string>()

/**
 * Resolve a GitHub username from an AuthUser's avatar URL.
 *
 * Neon Auth / Better Auth stores the GitHub avatar as
 * `https://avatars.githubusercontent.com/u/{numeric_id}`.
 * We hit the public GitHub API to convert that numeric ID into
 * the actual login handle (e.g. "octocat").
 *
 * Results are cached in-memory so repeat calls for the same user
 * never hit the network again.
 */
export async function resolveGitHubUsername(authUser: AuthUser): Promise<string> {
  const avatarMatch = authUser.image?.match(/avatars\.githubusercontent\.com\/u\/(\d+)/)
  const ghId = avatarMatch?.[1]

  // Check cache first
  if (ghId && _usernameCache.has(ghId)) {
    return _usernameCache.get(ghId)!
  }

  if (ghId) {
    try {
      const res = await fetch(`https://api.github.com/user/${ghId}`)
      if (res.ok) {
        const ghUser = await res.json()
        if (ghUser.login) {
          _usernameCache.set(ghId, ghUser.login)
          return ghUser.login
        }
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: use whatever the auth provider gave us
  const fallback = authUser.username || authUser.name || ''
  if (ghId && fallback) _usernameCache.set(ghId, fallback)
  return fallback
}
