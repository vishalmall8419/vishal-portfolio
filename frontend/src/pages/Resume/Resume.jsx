import { useMemo } from "react";
import {
  FiDownload,
  FiPrinter,
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiGlobe,
  FiInstagram,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import GlassCard from "../../components/ui/GlassCard";
import SectionTitle from "../../components/ui/SectionTitle";
import Button from "../../components/ui/Button";
import usePublicData from "../../hooks/usePublicData";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import "./Resume.css";

const SOCIAL_ICON_MAP = {
  github: FiGithub,
  linkedin: FiLinkedin,
  twitter: FiTwitter,
  x: FiTwitter,
  instagram: FiInstagram,
  website: FiGlobe,
  portfolio: FiGlobe,
};

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function Resume() {
  useSeo("resume", {
    title: "Resume — Vishal Mall",
    description: "Dynamic resume: experience, education, skills, certificates and achievements.",
  });

  const { data, loading } = usePublicData(() => publicApi.resume(), []);

  const settings = data?.settings || {};
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  const certificates = Array.isArray(data?.certificates) ? data.certificates : [];
  const achievements = Array.isArray(data?.achievements) ? data.achievements : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];

  const skillGroups = useMemo(() => {
    const groups = {};
    skills.forEach((s) => {
      const key = s.category || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });
    return Object.entries(groups);
  }, [skills]);

  const languages = useMemo(() => {
    if (!settings.languages) return [];
    return String(settings.languages)
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
  }, [settings.languages]);

  const socialEntries = useMemo(() => {
    const links = settings.socialLinks || {};
    return Object.entries(links).filter(([, url]) => Boolean(url));
  }, [settings.socialLinks]);

  const resumeFileUrl = resolveAssetUrl(settings.resume);
  const avatarUrl = resolveAssetUrl(settings.avatar);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <main className="resume-page">
        <Navbar />
        <div className="resume-loading">Loading resume…</div>
      </main>
    );
  }

  return (
    <>
      <main className="resume-page">
        <Navbar />

        <section className="resume-hero no-print">
          <div className="resume-container">
            <SectionTitle
              subtitle="RESUME"
              title="My"
              highlight=" Resume"
              description="A live, always up-to-date summary of my experience, education and skills."
              align="center"
            />

            <div className="resume-actions">
              <Button variant="primary" icon={<FiPrinter />} onClick={handlePrint}>
                Print Resume
              </Button>
              {resumeFileUrl ? (
                <a href={resumeFileUrl} target="_blank" rel="noreferrer" className="resume-download-link">
                  <Button variant="secondary" icon={<FiDownload />}>
                    Download PDF
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" icon={<FiDownload />} onClick={handlePrint}>
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="resume-sheet-wrap">
          <div className="resume-container">
            <div className="resume-sheet" id="resume-print-area">
              {/* Header */}
              <div className="resume-header">
                {avatarUrl && (
                  <img src={avatarUrl} alt={settings.name || "Profile"} className="resume-avatar" />
                )}
                <div className="resume-header-text">
                  <h1>{settings.name || "Your Name"}</h1>
                  {settings.role && <p className="resume-role">{settings.role}</p>}

                  <div className="resume-contact-row">
                    {settings.email && (
                      <span className="resume-contact-item">
                        <FiMail /> {settings.email}
                      </span>
                    )}
                    {settings.phone && (
                      <span className="resume-contact-item">
                        <FiPhone /> {settings.phone}
                      </span>
                    )}
                    {settings.address && (
                      <span className="resume-contact-item">
                        <FiMapPin /> {settings.address}
                      </span>
                    )}
                  </div>

                  {socialEntries.length > 0 && (
                    <div className="resume-social-row">
                      {socialEntries.map(([key, url]) => {
                        const Icon = SOCIAL_ICON_MAP[key.toLowerCase()] || FiGlobe;
                        return (
                          <a
                            key={key}
                            href={/^https?:\/\//i.test(url) ? url : `https://${url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="resume-social-link"
                            aria-label={key}
                          >
                            <Icon />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* About / Summary */}
              {settings.careerObjective && (
                <div className="resume-section">
                  <h2 className="resume-section-title">About</h2>
                  <p className="resume-summary">{settings.careerObjective}</p>
                </div>
              )}

              <div className="resume-columns">
                <div className="resume-col-main">
                  {/* Experience */}
                  {experience.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Experience</h2>
                      <div className="resume-timeline">
                        {experience.map((exp) => (
                          <div className="resume-timeline-item" key={exp.id}>
                            <div className="resume-timeline-dot" />
                            <div className="resume-timeline-content">
                              <div className="resume-item-head">
                                <h3>{exp.title}</h3>
                                {exp.year && <span className="resume-item-date">{exp.year}</span>}
                              </div>
                              {exp.company && <p className="resume-item-sub">{exp.company}</p>}
                              {exp.description && <p className="resume-item-desc">{exp.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Education</h2>
                      <div className="resume-timeline">
                        {education.map((edu) => (
                          <div className="resume-timeline-item" key={edu.id}>
                            <div className="resume-timeline-dot" />
                            <div className="resume-timeline-content">
                              <div className="resume-item-head">
                                <h3>{edu.degree}</h3>
                                {edu.session && <span className="resume-item-date">{edu.session}</span>}
                              </div>
                              <p className="resume-item-sub">
                                {edu.institute}
                                {edu.marks ? ` · ${edu.marks}` : ""}
                              </p>
                              {edu.description && <p className="resume-item-desc">{edu.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Projects */}
                  {projects.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Selected Projects</h2>
                      <div className="resume-project-grid">
                        {projects.map((p) => (
                          <div className="resume-project-item" key={p.id}>
                            <h3>{p.title}</h3>
                            {p.shortDescription && <p>{p.shortDescription}</p>}
                            {Array.isArray(p.technologies) && p.technologies.length > 0 && (
                              <div className="resume-tag-row">
                                {p.technologies.slice(0, 6).map((t) => (
                                  <span className="resume-tag" key={t}>
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="resume-col-side">
                  {/* Skills */}
                  {skillGroups.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Skills</h2>
                      {skillGroups.map(([category, list]) => (
                        <div className="resume-skill-group" key={category}>
                          <h4>{category}</h4>
                          {list.map((s) => (
                            <div className="resume-skill-row" key={s.id}>
                              <span className="resume-skill-name">{s.name}</span>
                              <div className="resume-skill-bar">
                                <div
                                  className="resume-skill-bar-fill"
                                  style={{ width: `${Math.min(Math.max(s.proficiency ?? 50, 0), 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Languages */}
                  {languages.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Languages</h2>
                      <div className="resume-tag-row">
                        {languages.map((l) => (
                          <span className="resume-tag" key={l}>
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificates */}
                  {certificates.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Certificates</h2>
                      <ul className="resume-simple-list">
                        {certificates.map((c) => (
                          <li key={c.id}>
                            <strong>{c.title}</strong>
                            <span>
                              {c.issuer}
                              {c.issueDate ? ` · ${formatDate(c.issueDate)}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Achievements */}
                  {achievements.length > 0 && (
                    <div className="resume-section">
                      <h2 className="resume-section-title">Achievements</h2>
                      <ul className="resume-simple-list">
                        {achievements.map((a) => (
                          <li key={a.id}>
                            <strong>{a.title}</strong>
                            {(a.briefDescription || a.date) && (
                              <span>
                                {a.briefDescription}
                                {a.date ? ` · ${formatDate(a.date)}` : ""}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

export default Resume;
