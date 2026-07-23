import "./About.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import Button from "../../ui/Button";
import useTheme from "../../../hooks/useTheme";
import { resolveAssetUrl } from "../../../lib/publicApi";

function About() {
  const { siteSettings } = useTheme();
  const name = siteSettings?.name || "Vishal Mall";
  const role = siteSettings?.role || "Java Full Stack Developer";
  const location = siteSettings?.address || "Uttar Pradesh, India";
  const avatarUrl = resolveAssetUrl(siteSettings?.avatar);
  const resumeUrl = resolveAssetUrl(siteSettings?.resume);

  return (
    <section className="vm-about">

      <div className="vm-about-container">

        <SectionTitle
          subtitle="ABOUT ME"
          title="Passionate"
          highlight=" Developer"
          description="I'm a Full Stack Developer focused on building scalable, modern and high-performance web applications with beautiful user experiences."
        />

        <div className="vm-about-grid">

          <div className="vm-about-image">

            <GlassCard padding="lg">

              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="vm-about-photo" />
              ) : (
                <div className="vm-profile-placeholder">

                  PROFILE IMAGE

                </div>
              )}

            </GlassCard>

          </div>

          <div className="vm-about-content">

            <GlassCard>

              <h3>
                Hi, I'm {name} 👋
              </h3>

              <p>
                I enjoy creating premium web applications using Java,
                React, Spring Boot and MySQL. My focus is writing clean,
                scalable and production-ready code while continuously
                learning modern technologies.
              </p>

              <div className="vm-about-info">

                <div>
                  <strong>Name</strong>
                  <span>{name}</span>
                </div>

                <div>
                  <strong>Role</strong>
                  <span>{role}</span>
                </div>

                <div>
                  <strong>Location</strong>
                  <span>{location}</span>
                </div>

                <div>
                  <strong>Experience</strong>
                  <span>Learning & Building Projects</span>
                </div>

              </div>

              <div className="vm-about-btn">

                {resumeUrl ? (
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="vm-about-resume-link">
                    <Button>Download Resume</Button>
                  </a>
                ) : (
                  <Button disabled>Download Resume</Button>
                )}

              </div>

            </GlassCard>

          </div>

        </div>

      </div>

    </section>
  );
}

export default About;