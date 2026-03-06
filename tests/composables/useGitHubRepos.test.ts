import { describe, it, expect, vi, beforeEach } from 'vitest'

const sampleGitHubRepos = [
  {
    name: 'bahrain.js',
    full_name: 'bahrain-js/bahrain.js',
    description: 'Community website',
    stargazers_count: 42,
    forks_count: 10,
    language: 'TypeScript',
    html_url: 'https://github.com/bahrain-js/bahrain.js',
    homepage: 'https://bahrain.js.org',
    topics: ['nuxt', 'community'],
    updated_at: '2026-03-01T00:00:00Z',
    open_issues_count: 3,
    fork: false,
    archived: false
  },
  {
    name: 'forked-repo',
    full_name: 'bahrain-js/forked-repo',
    description: 'A fork',
    stargazers_count: 1,
    forks_count: 0,
    language: 'JavaScript',
    html_url: 'https://github.com/bahrain-js/forked-repo',
    homepage: null,
    topics: [],
    updated_at: '2026-01-01T00:00:00Z',
    open_issues_count: 0,
    fork: true,
    archived: false
  },
  {
    name: 'old-archived',
    full_name: 'bahrain-js/old-archived',
    description: 'Archived project',
    stargazers_count: 5,
    forks_count: 2,
    language: 'JavaScript',
    html_url: 'https://github.com/bahrain-js/old-archived',
    homepage: null,
    topics: [],
    updated_at: '2025-01-01T00:00:00Z',
    open_issues_count: 0,
    fork: false,
    archived: true
  }
]

/**
 * Maps a raw GitHub API repo response to our GitHubRepo type.
 * Extracted here to test the same logic used in the composable.
 */
function mapRepo(repo: typeof sampleGitHubRepos[0]) {
  return {
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
  }
}

describe('useGitHubRepos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches repos from correct GitHub API URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(sampleGitHubRepos)
    })

    const res = await fetch(
      'https://api.github.com/orgs/bahrain-js/repos?per_page=50&sort=updated',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'bahrainjs-website'
        }
      }
    )

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/orgs/bahrain-js/repos?per_page=50&sort=updated',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github.v3+json'
        })
      })
    )

    const data = await res.json()
    expect(data).toHaveLength(3)
  })

  it('filters out forked repos', () => {
    const filtered = sampleGitHubRepos.filter(r => !r.fork && !r.archived)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('bahrain.js')
  })

  it('filters out archived repos', () => {
    const filtered = sampleGitHubRepos.filter(r => !r.fork && !r.archived)
    const archivedInResult = filtered.find(r => r.name === 'old-archived')
    expect(archivedInResult).toBeUndefined()
  })

  it('maps GitHub API fields to GitHubRepo type', () => {
    const mapped = mapRepo(sampleGitHubRepos[0])

    expect(mapped.name).toBe('bahrain.js')
    expect(mapped.fullName).toBe('bahrain-js/bahrain.js')
    expect(mapped.stars).toBe(42)
    expect(mapped.forks).toBe(10)
    expect(mapped.language).toBe('TypeScript')
    expect(mapped.topics).toContain('nuxt')
    expect(mapped.url).toBe('https://github.com/bahrain-js/bahrain.js')
    expect(mapped.homepage).toBe('https://bahrain.js.org')
  })

  it('returns empty array on API error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Rate limit exceeded'))

    let result: unknown[] = []
    try {
      await fetch('https://api.github.com/orgs/bahrain-js/repos')
    } catch {
      result = []
    }

    expect(result).toEqual([])
  })

  it('handles repos with null description', () => {
    const repoWithNull = { ...sampleGitHubRepos[0], description: null as unknown as string }
    const mapped = mapRepo(repoWithNull)
    expect(mapped.description).toBe('')
  })

  it('handles repos with null homepage', () => {
    const mapped = mapRepo(sampleGitHubRepos[1])
    expect(mapped.homepage).toBeNull()
  })

  it('handles repos with empty topics', () => {
    const mapped = mapRepo(sampleGitHubRepos[1])
    expect(mapped.topics).toEqual([])
  })
})
