// Thin wrapper around the public GitHub REST API. No new dependency --
// uses Node's built-in global fetch. Responses are cached in-memory for a
// few minutes per username, since unauthenticated GitHub API calls are
// capped at 60 requests/hour and this data doesn't need to be real-time.

const GITHUB_API = "https://api.github.com";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const README_CACHE_TTL_MS = 30 * 60 * 1000; // READMEs change less often

const cache = new Map(); // key -> { data, expiresAt }

function getCached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.data;
}

function setCached(key, data, ttl) {
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

async function githubFetch(path) {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-open-source-page" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`GitHub API ${res.status} for ${path}: ${body.slice(0, 200)}`);
    err.status = res.status === 404 ? 404 : 502;
    throw err;
  }
  return res.json();
}

// Aggregated payload for the /open-source page: profile + repos + computed
// stats + a language breakdown, in one call.
async function getProfileBundle(username) {
  const cacheKey = `bundle:${username.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const [profile, repos] = await Promise.all([
    githubFetch(`/users/${encodeURIComponent(username)}`),
    githubFetch(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`),
  ]);

  const visibleRepos = repos.filter((r) => !r.fork || r.stargazers_count > 0);

  const totalStars = visibleRepos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = visibleRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  const languageCounts = {};
  for (const r of visibleRepos) {
    if (!r.language) continue;
    languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
  }
  const totalWithLanguage = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(languageCounts)
    .map(([name, count]) => ({ name, count, percent: Math.round((count / totalWithLanguage) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topRepos = [...visibleRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map((r) => r.id);

  const bundle = {
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      htmlUrl: profile.html_url,
      company: profile.company,
      location: profile.location,
      blog: profile.blog,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      createdAt: profile.created_at,
    },
    stats: {
      totalStars,
      totalForks,
      totalRepos: visibleRepos.length,
    },
    languages,
    repos: visibleRepos
      .map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        htmlUrl: r.html_url,
        homepage: r.homepage,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        watchers: r.watchers_count,
        isFork: r.fork,
        updatedAt: r.pushed_at,
        topics: r.topics || [],
        pinned: topRepos.includes(r.id),
      }))
      .sort((a, b) => (b.pinned === a.pinned ? b.stars - a.stars : b.pinned ? 1 : -1)),
  };

  setCached(cacheKey, bundle, CACHE_TTL_MS);
  return bundle;
}

async function getReadme(username, repo) {
  const cacheKey = `readme:${username.toLowerCase()}/${repo.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await githubFetch(
    `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`
  );
  const content = data.content
    ? Buffer.from(data.content, data.encoding || "base64").toString("utf8")
    : "";

  const result = { content, htmlUrl: data.html_url };
  setCached(cacheKey, result, README_CACHE_TTL_MS);
  return result;
}

module.exports = { getProfileBundle, getReadme };
