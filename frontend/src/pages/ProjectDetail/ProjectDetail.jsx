import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiExternalLink, FiGithub, FiArrowLeft, FiArrowRight, FiChevronLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import "./ProjectDetail.css";

function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useSeo(`project-${slug}`, {
    title: project ? `${project.title} — Vishal Mall` : "Project — Vishal Mall",
    description: project?.shortDescription || project?.description,
    image: project?.image,
  });

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    Promise.all([publicApi.projectBySlug(slug), publicApi.projects()])
      .then(([detailRes, listRes]) => {
        if (cancelled) return;
        setProject(detailRes?.data?.data ?? null);
        setAllProjects(Array.isArray(listRes?.data?.data) ? listRes.data.data : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <>
        <main className="pd-page">
          <Navbar />
          <div className="pd-state">Loading project...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "error" || !project) {
    return (
      <>
        <main className="pd-page">
          <Navbar />
          <div className="pd-state">
            <h2>Project not found</h2>
            <p>This project doesn&rsquo;t exist or may have been unpublished.</p>
            <Link to="/projects" className="pd-back"><FiArrowLeft /> Back to Projects</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id && p.category === project.category)
    .slice(0, 3);

  return (
    <>
      <main className="pd-page">
        <Navbar />

        <article className="pd-article">
          <Link to="/projects" className="pd-back"><FiArrowLeft /> Back to Projects</Link>

          {/* Hero */}
          <header className="pd-hero">
            {project.category && <span className="pd-tag">{project.category}</span>}
            <h1 className="pd-title">{project.title}</h1>
            {project.shortDescription && <p className="pd-lede">{project.shortDescription}</p>}

            <div className="pd-links">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="pd-btn pd-btn--primary">
                  <FiExternalLink /> Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="pd-btn pd-btn--ghost">
                  <FiGithub /> GitHub
                </a>
              )}
            </div>
          </header>

          {/* Cover image */}
          {project.image && (
            <div className="pd-cover">
              <img src={resolveAssetUrl(project.image)} alt={project.title} />
            </div>
          )}

          <div className="pd-body">
            {/* Overview */}
            <section className="pd-section">
              <h2>Project Overview</h2>
              {String(project.description || "")
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </section>

            {/* Technologies */}
            {Array.isArray(project.technologies) && project.technologies.length > 0 && (
              <section className="pd-section">
                <h2>Technologies</h2>
                <div className="pd-tech-list">
                  {project.technologies.map((t) => (
                    <span key={t} className="pd-tech-chip">{t}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Prev / Next */}
          {(prevProject || nextProject) && (
            <nav className="pd-prevnext">
              {prevProject ? (
                <button className="pd-prevnext-btn" onClick={() => navigate(`/projects/${prevProject.slug || prevProject.id}`)}>
                  <FiChevronLeft /> <span>{prevProject.title}</span>
                </button>
              ) : <span />}
              {nextProject && (
                <button className="pd-prevnext-btn pd-prevnext-btn--next" onClick={() => navigate(`/projects/${nextProject.slug || nextProject.id}`)}>
                  <span>{nextProject.title}</span> <FiArrowRight />
                </button>
              )}
            </nav>
          )}

          {/* Related projects */}
          {relatedProjects.length > 0 && (
            <section className="pd-related">
              <h2>Related Projects</h2>
              <div className="pd-related-grid">
                {relatedProjects.map((p) => (
                  <Link key={p.id} to={`/projects/${p.slug || p.id}`} className="pd-related-card">
                    {p.image && <img src={resolveAssetUrl(p.image)} alt={p.title} />}
                    <span>{p.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}

export default ProjectDetail;
