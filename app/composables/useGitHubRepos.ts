import type { GitHubRepo } from '~/types'

const GITHUB_ORG = 'bahrain-js'

/**
 * Fetches public repos from the Bahrain.js GitHub organization.
 * Returns non-forked, non-archived repos sorted by last updated.
 *
 * Uses plain ref + client-side fetch instead of useAsyncData because
 * this composable is only used on `ssr: false` routes (projects page).
 * useAsyncData crashes on direct navigation to static ssr:false pages
 * because the Nuxt payload object is undefined — getCachedData tries
 * to read `payload.data['github-repos']` which throws.
 */
export function useGitHubRepos() {
  const data = useState<GitHubRepo[]>('github-repos', () => [])
  const status = ref<'idle' | 'pending' | 'success' | 'error'>('idle')
  const error = ref<Error | null>(null)

  async function refresh() {
    status.value = 'pending'
    error.value = null
    try {
      const repos = await $fetch<Record<string, unknown>[]>(
        `https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=50&sort=updated`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'bahrainjs-website'
          }
        }
      )

      data.value = repos
        .filter(repo => !repo.fork && !repo.archived)
        .map(repo => ({
          name: repo.name as string,
          fullName: repo.full_name as string,
          description: (repo.description as string) || '',
          stars: repo.stargazers_count as number,
          forks: repo.forks_count as number,
          language: repo.language as string | null,
          url: repo.html_url as string,
          homepage: repo.homepage as string | null,
          topics: (repo.topics as string[]) || [],
          updatedAt: repo.updated_at as string,
          openIssues: repo.open_issues_count as number
        }))
      status.value = 'success'
    } catch (err: unknown) {
      console.error('[useGitHubRepos] GitHub API error:', (err as Error).message)
      error.value = err as Error
      data.value = []
      status.value = 'error'
    }
  }

  // Fetch on first client-side use if not already loaded
  if (import.meta.client && !data.value.length && status.value === 'idle') {
    refresh()
  }

  return { data, status, error, refresh }
}
