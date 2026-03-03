interface GitHubRepo {
  name: string
  fullName: string
  description: string
  stars: number
  forks: number
  language: string | null
  url: string
  homepage: string | null
  topics: string[]
  updatedAt: string
  openIssues: number
}

export function useGitHubRepos() {
  return useAsyncData<GitHubRepo[]>('github-repos', async () => {
    try {
      const repos = await $fetch<any[]>('https://api.github.com/orgs/bahrain-js/repos?per_page=50&sort=updated', {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'bahrainjs-website'
        }
      })

      return repos
        .filter((repo: any) => !repo.fork && !repo.archived)
        .map((repo: any) => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || '',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          url: repo.html_url,
          homepage: repo.homepage,
          topics: repo.topics || [],
          updatedAt: repo.updated_at,
          openIssues: repo.open_issues_count
        }))
    } catch (error: any) {
      console.error('GitHub API error:', error.message)
      return []
    }
  })
}
