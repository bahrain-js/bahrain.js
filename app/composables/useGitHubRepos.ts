import type { GitHubRepo } from '~/types'

const GITHUB_ORG = 'bahrain-js'

/**
 * Fetches public repos from the Bahrain.js GitHub organization.
 * Returns non-forked, non-archived repos sorted by last updated.
 *
 * Uses `useAsyncData` for SSR payload deduplication and client-side caching.
 */
export function useGitHubRepos() {
  return useAsyncData<GitHubRepo[]>('github-repos', async () => {
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

      return repos
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
    } catch (error: unknown) {
      console.error('[useGitHubRepos] GitHub API error:', (error as Error).message)
      return []
    }
  }, {
    server: false,
    lazy: true,
    default: () => []
  })
}
