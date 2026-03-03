export default defineCachedEventHandler(async () => {
  try {
    const response = await fetch('https://api.github.com/orgs/bahrain-js/repos?per_page=50&sort=updated', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'bahrainjs-website'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub API responded with ${response.status}`)
    }

    const repos = await response.json()

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
}, {
  maxAge: 60 * 60, // Cache for 1 hour
  name: 'github-repos'
})
