import { useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiFacebook,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUp,
  FiSend,
  FiCheck,
} from "react-icons/fi";
import {
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMysql,
  SiJavascript,
  SiBootstrap,
  SiTailwindcss,
  SiSpring,
  SiGit,
  SiTypescript,
  SiHtml5,
  SiCss,
  SiMongodb,
} from "react-icons/si";
import useTheme from "../../hooks/useTheme";
import usePublicData from "../../hooks/usePublicData";
import { publicApi, resolveAssetUrl, normalizeUrl } from "../../lib/publicApi";
import MagneticButton from "../ui/MagneticButton";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const SOCIAL_ICONS = {
  github: FiGithub,
  linkedin: FiLinkedin,
  twitter: FiTwitter,
  x: FiTwitter,
  instagram: FiInstagram,
  youtube: FiYoutube,
  facebook: FiFacebook,
  website: FiGlobe,
};

const FALLBACK_TECHNOLOGIES = [
  "React",
  "Node.js",
  "Express.js",
  "MySQL",
  "Java",
  "Spring Boot",
  "GSAP",
  "Bootstrap",
];

// Maps a skill/technology name to a recognizable brand icon. Falls back to
// an initial-letter chip (same fallback language TechStack.jsx already uses)
// for anything not in the map, so unexpected admin-entered skills never break.
const TECH_ICON_MAP = [
  [/node/i, SiNodedotjs],
  [/express/i, SiExpress],
  [/react/i, SiReact],
  [/mysql/i, SiMysql],
  [/javascript/i, SiJavascript],
  [/bootstrap/i, SiBootstrap],
  [/tailwind/i, SiTailwindcss],
  [/spring/i, SiSpring],
  [/git(?!hub)/i, SiGit],
  [/typescript/i, SiTypescript],
  [/html/i, SiHtml5],
  [/css/i, SiCss],
  [/mongo/i, SiMongodb],
];

const getTechIcon = (name = "") => {
  const match = TECH_ICON_MAP.find(([pattern]) => pattern.test(name));
  return match ? match[1] : null;
};

const LEGAL_LINKS = ["Privacy Policy", "Terms & Conditions", "Cookie Policy"];

function Footer() {
  const footerRef = useRef(null);
  const navigate = useNavigate();
  const { siteSettings } = useTheme();
  const { data: skillsData } = usePublicData(() => publicApi.skills(), []);
  const { data: servicesData } = usePublicData(() => publicApi.services(), []);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // idle | sending | sent | error

  const siteName = siteSettings?.name || "Vishal Mall";
  const logoUrl = resolveAssetUrl(siteSettings?.logo);
  const email = siteSettings?.email || "vishal.mall02@outlook.com";
  const phone = siteSettings?.phone;
  const location = siteSettings?.address;
  const socialLinks = siteSettings?.socialLinks || {};
  const activeSocials = Object.entries(socialLinks).filter(([, url]) => !!url);
  const year = new Date().getFullYear();

  const technologies =
    Array.isArray(skillsData) && skillsData.length
      ? Array.from(new Set(skillsData.map((s) => s.name))).slice(0, 8)
      : FALLBACK_TECHNOLOGIES;

  const services =
    Array.isArray(servicesData) && servicesData.length
      ? servicesData.slice(0, 6).map((s) => s.title)
      : ["Full Stack Development", "Frontend Development", "Backend Development", "UI/UX Design", "API Development", "Database Design"];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".vm-footer-reveal",
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 92%" },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGlassMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newsletterEmail.trim();
    if (!trimmed || newsletterStatus === "sending") return;
    setNewsletterStatus("sending");
    try {
      await publicApi.newsletterSubscribe(trimmed);
      setNewsletterStatus("sent");
      setNewsletterEmail("");
    } catch (err) {
      setNewsletterStatus("error");
    } finally {
      setTimeout(() => setNewsletterStatus("idle"), 4000);
    }
  };

  return (
    <footer className="vm-footer" ref={footerRef}>
      <div className="vm-footer-glow vm-footer-glow-a" aria-hidden="true" />
      <div className="vm-footer-glow vm-footer-glow-b" aria-hidden="true" />
      <div className="vm-footer-noise" aria-hidden="true" />

      <div className="vm-footer-container">
        <div className="vm-footer-top">
          <div className="vm-footer-brand vm-footer-reveal">
            <Link to="/" className="vm-footer-logo-row">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="vm-footer-logo" />
              ) : (
                <span className="vm-footer-logo-dot" aria-hidden="true" />
              )}
              <span className="vm-footer-brand-name">{siteName}</span>
            </Link>

            <p className="vm-footer-brand-desc">
              Java Full Stack Developer crafting modern, scalable and premium
              web applications with clean architecture and thoughtful design.
            </p>

            <span className="vm-footer-tagline">
              Code with purpose. Design with intent.
            </span>
          </div>

          <nav className="vm-footer-col vm-footer-reveal" aria-label="Quick links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/skills">Skills</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/resume">Resume</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>

          <div className="vm-footer-col vm-footer-reveal">
            <h3>Services</h3>
            <ul>
              {services.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="vm-footer-col vm-footer-reveal">
            <h3>Technologies</h3>
            <ul>
              {technologies.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="vm-footer-col vm-footer-contact vm-footer-reveal">
            <h3>Get In Touch</h3>
            <ul className="vm-footer-contact-list">
              <li>
                <a href={`mailto:${email}`}>
                  <FiMail /> <span>{email}</span>
                </a>
              </li>
              {phone && (
                <li>
                  <a href={`tel:${phone}`}>
                    <FiPhone /> <span>{phone}</span>
                  </a>
                </li>
              )}
              {location && (
                <li className="vm-footer-static">
                  <FiMapPin /> <span>{location}</span>
                </li>
              )}
            </ul>
            <span className="vm-footer-availability">
              <span className="vm-footer-availability-dot" />
              Available for new projects
            </span>
          </div>
        </div>

        <div className="vm-footer-middle vm-footer-reveal">
          <div
            className="vm-footer-panel vm-footer-tech-panel"
            onMouseMove={handleGlassMove}
          >
            <span className="vm-footer-panel-label">Built With</span>
            <div className="vm-footer-tech-badges">
              {technologies.map((tech) => {
                const Icon = getTechIcon(tech);
                return (
                  <span key={tech} className="vm-footer-tech-badge" title={tech}>
                    {Icon ? <Icon /> : <span className="vm-footer-tech-fallback">{tech.charAt(0)}</span>}
                    <span className="vm-footer-tech-name">{tech}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div
            className="vm-footer-panel vm-footer-newsletter-panel"
            onMouseMove={handleGlassMove}
          >
            <span className="vm-footer-panel-label">Stay Updated</span>
            <h4>Get occasional project updates</h4>

            <form className="vm-footer-newsletter" onSubmit={handleNewsletterSubmit}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="vm-footer-newsletter-row">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={newsletterStatus === "sending" || newsletterStatus === "sent"}
                />
                <button
                  type="submit"
                  className={newsletterStatus === "sent" ? "is-sent" : ""}
                  disabled={newsletterStatus === "sending" || newsletterStatus === "sent"}
                >
                  {newsletterStatus === "sent" ? (
                    <FiCheck />
                  ) : (
                    <FiSend />
                  )}
                  {" "}
                  {newsletterStatus === "sent"
                    ? "Subscribed"
                    : newsletterStatus === "sending"
                    ? "Sending…"
                    : newsletterStatus === "error"
                    ? "Try again"
                    : "Subscribe"}
                </button>
              </div>
              {newsletterStatus === "error" && (
                <p className="vm-footer-newsletter-status is-error">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>

          <div
            className="vm-footer-panel vm-footer-cta-panel"
            onMouseMove={handleGlassMove}
          >
            <span className="vm-footer-panel-label">Let's Talk</span>
            <h4>Let's Build Something Amazing Together</h4>
            <MagneticButton onClick={() => navigate("/hire-me")}>
              Get In Touch
            </MagneticButton>
          </div>
        </div>

        <div className="vm-footer-bottom vm-footer-reveal">
          <ul className="vm-footer-social">
            {activeSocials.length > 0 ? (
              activeSocials.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key] || FiGlobe;
                return (
                  <li key={key}>
                    <a
                      href={normalizeUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })
            ) : (
              <li>
                <a href={`mailto:${email}`} aria-label="Email">
                  <FiMail />
                </a>
              </li>
            )}
          </ul>

          <ul className="vm-footer-legal">
            {LEGAL_LINKS.map((item) => (
              <li key={item}>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <div className="vm-footer-copyright">
            <span>&copy; {year} {siteName}. All Rights Reserved.</span>
            <small>Built with React, Node.js, Express.js, MySQL &amp; GSAP.</small>
          </div>

          <button className="vm-footer-top-btn" onClick={scrollToTop} aria-label="Back to top">
            <FiArrowUp />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
