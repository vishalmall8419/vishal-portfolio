import { useEffect, useState } from "react";
import {
  FiStar,
  FiGitBranch,
  FiEye,
  FiExternalLink,
  FiGithub,
  FiUsers,
  FiMapPin,
  FiFileText,
  FiX,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import { publicApi } from "../../lib/publicApi";
import useSeo from "../../hooks/useSeo";
import "./OpenSource.css";

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Ruby: "#701516",
};

function langColor(name) {
  return LANGUAGE_COLORS[name] || "var(--primary)";
}

function ReadmeModal({ username, repo, onClose }) {
  const [state, setState] = useState({ loading: true, content: "", error: null });

  useEffect(() => {
    let active = true;
    publicApi
      .githubReadme(repo)
      .then(({ data }) => {
        if (!active) return;
        setState({ loading: false, content: data?.data?.content || "", error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ loading: false, content: "", error: "No README available for this repository." });
      });
    return () => {
      active = false;
    };
  }, [repo]);

  return (
    <div className="os-modal-backdrop" onClick={onClose}>
      <div className="os-modal" onClick={(e) => e.stopPropagation()}>
        <div className="os-modal-head">
          <h3>{repo}</h3>
          <button className="os-modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="os-modal-body">
          {state.loading && <p className="os-modal-status">Loading README…</p>}
          {state.error && <p className="os-modal-status">{state.error}</p>}
          {!state.loading && !state.error && <pre className="os-readme">{state.content}</pre>}
        </div>
      </div>
    </div>
  );
}

function OpenSource() {
  useSeo("open-source", {
    title: "Open Source",
    description: "GitHub activity, repositories, and open source contributions.",
  });

  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [readmeRepo, setReadmeRepo] = useState(null);
  const [langFilter, setLangFilter] = useState(null);

  useEffect(() => {
    let active = true;
    publicApi
      .github()
      .then(({ data }) => {
        if (!active) return;
        setState({ loading: false, data: data?.data || null, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({ loading: false, data: null, error: "Couldn't load GitHub data right now." });
      });
    return () => {
      active = false;
    };
  }, []);

  const { loading, data, error } = state;
  const configured = data?.configured;

  const repos = configured ? (langFilter ? data.repos.filter((r) => r.language === langFilter) : data.repos) : [];

  return (
    <>
      <main className="opensource-page">
        <Navbar />

        <section className="os-hero">
          <span className="os-eyebrow">// open-source</span>
          <h1 className="os-title">
            Building in the <span>open.</span>
          </h1>
          <p className="os-subtitle">
            A live look at what's on GitHub — repositories, stars, and the languages behind them.
          </p>
        </section>

        {loading && (
          <div className="os-state">
            <span className="os-spinner" />
            <p>Fetching live data from GitHub…</p>
          </div>
        )}

        {!loading && error && (
          <div className="os-state">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && configured === false && (
          <div className="os-state">
            <FiGithub size={32} />
            <p>GitHub integration isn't connected yet.</p>
            <span className="os-state-hint">
              Add a GitHub username in Admin → Settings → Social Links to bring this page to life.
            </span>
          </div>
        )}

        {!loading && !error && configured && (
          <>
            <section className="os-profile">
              <img src={data.profile.avatarUrl} alt={data.profile.login} className="os-avatar" />
              <div className="os-profile-info">
                <h2>{data.profile.name || data.profile.login}</h2>
                <p className="os-handle">@{data.profile.login}</p>
                {data.profile.bio && <p className="os-bio">{data.profile.bio}</p>}
                <div className="os-meta-row">
                  {data.profile.location && (
                    <span>
                      <FiMapPin /> {data.profile.location}
                    </span>
                  )}
                  <span>
                    <FiUsers /> {data.profile.followers} followers
                  </span>
                </div>
                <a
                  className="os-profile-link"
                  href={data.profile.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiGithub /> View on GitHub <FiExternalLink size={14} />
                </a>
              </div>
            </section>

            <section className="os-stats">
              <div className="os-stat-card">
                <span className="os-stat-value">{data.stats.totalRepos}</span>
                <span className="os-stat-label">Repositories</span>
              </div>
              <div className="os-stat-card">
                <span className="os-stat-value">{data.stats.totalStars}</span>
                <span className="os-stat-label">Total Stars</span>
              </div>
              <div className="os-stat-card">
                <span className="os-stat-value">{data.stats.totalForks}</span>
                <span className="os-stat-label">Total Forks</span>
              </div>
              <div className="os-stat-card">
                <span className="os-stat-value">{data.profile.publicRepos}</span>
                <span className="os-stat-label">Public Repos</span>
              </div>
            </section>

            {data.languages.length > 0 && (
              <section className="os-languages">
                <h3>Top Languages</h3>
                <div className="os-lang-bar">
                  {data.languages.map((l) => (
                    <span
                      key={l.name}
                      style={{ width: `${l.percent}%`, background: langColor(l.name) }}
                      title={`${l.name} — ${l.percent}%`}
                    />
                  ))}
                </div>
                <div className="os-lang-legend">
                  <button
                    className={`os-lang-chip ${!langFilter ? "is-active" : ""}`}
                    onClick={() => setLangFilter(null)}
                  >
                    All
                  </button>
                  {data.languages.map((l) => (
                    <button
                      key={l.name}
                      className={`os-lang-chip ${langFilter === l.name ? "is-active" : ""}`}
                      onClick={() => setLangFilter(l.name === langFilter ? null : l.name)}
                    >
                      <span className="os-lang-dot" style={{ background: langColor(l.name) }} />
                      {l.name} <em>{l.percent}%</em>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section className="os-repos">
              <h3>Repositories {langFilter ? `— ${langFilter}` : ""}</h3>
              <div className="os-repo-grid">
                {repos.map((repo) => (
                  <div className="os-repo-card" key={repo.id}>
                    {repo.pinned && <span className="os-repo-pin">Pinned</span>}
                    <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="os-repo-name">
                      {repo.name}
                    </a>
                    <p className="os-repo-desc">{repo.description || "No description provided."}</p>
                    {repo.topics.length > 0 && (
                      <div className="os-repo-topics">
                        {repo.topics.slice(0, 4).map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="os-repo-meta">
                      {repo.language && (
                        <span>
                          <span className="os-lang-dot" style={{ background: langColor(repo.language) }} />
                          {repo.language}
                        </span>
                      )}
                      <span>
                        <FiStar /> {repo.stars}
                      </span>
                      <span>
                        <FiGitBranch /> {repo.forks}
                      </span>
                      <span>
                        <FiEye /> {repo.watchers}
                      </span>
                    </div>
                    <button className="os-repo-readme-btn" onClick={() => setReadmeRepo(repo.name)}>
                      <FiFileText /> README
                    </button>
                  </div>
                ))}
              </div>
              {repos.length === 0 && <p className="os-state-hint">No repositories to show.</p>}
            </section>
          </>
        )}
      </main>
      <Footer />

      {readmeRepo && (
        <ReadmeModal username={data?.profile?.login} repo={readmeRepo} onClose={() => setReadmeRepo(null)} />
      )}
    </>
  );
}

export default OpenSource;
