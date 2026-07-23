import React, { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FiCode,
  FiServer,
  FiLayers,
  FiFigma,
  FiZap,
  FiTool,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import "./Services.css";
import Navbar from "../../components/Navbar";
import usePublicData from "../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import Footer from "../../components/Footer/Footer";
import useTheme from "../../hooks/useTheme";
import useSeo from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

/*  FALLBACK CONTENT — shown only while the CMS has no services yet    */
/*  or the API is unreachable, so the page never renders empty.        */

const FALLBACK_ICONS = [FiCode, FiServer, FiLayers, FiFigma, FiZap, FiTool];

const FALLBACK_SERVICES = [
  {
    id: 1,
    title: "Frontend Development",
    description:
      "Modern, responsive and interactive websites using React, Tailwind CSS and JavaScript — built for performance and long-term maintainability.",
    features: ["React & Vite tooling", "Pixel-accurate UI", "Fluid responsive layouts", "Smooth GSAP interactions"],
    price: "Starting at $499",
  },
  {
    id: 2,
    title: "Backend Development",
    description:
      "Scalable REST APIs with Node.js, Express, Java and Spring Boot, backed by well-modelled MySQL or MongoDB data layers.",
    features: ["REST API design", "Authentication & RBAC", "Database schema design", "Rate limiting & security"],
    price: "Starting at $599",
  },
  {
    id: 3,
    title: "Full Stack Development",
    description:
      "Complete end-to-end application development — from database schema and API design through to a shipped, deployed product.",
    features: ["End-to-end ownership", "CI/CD & deployment", "Admin dashboards", "Ongoing iteration"],
    price: "Starting at $999",
  },
  {
    id: 4,
    title: "UI / UX Design",
    description:
      "Premium interface design inspired by Apple, Stripe, Linear and Framer — wireframed, prototyped and handed off clean.",
    features: ["Figma wireframes", "Design systems", "Micro-interactions", "Accessibility-first"],
    price: "Starting at $399",
  },
  {
    id: 5,
    title: "Performance Optimization",
    description:
      "Faster loading, better Core Web Vitals and stronger SEO — audited and fixed against real Lighthouse metrics.",
    features: ["Lighthouse audits", "Bundle-size reduction", "SEO fundamentals", "Accessibility fixes"],
    price: "Starting at $249",
  },
  {
    id: 6,
    title: "Website Maintenance",
    description:
      "Ongoing support and iteration after launch — bug fixes, new features and monitoring so the product keeps working.",
    features: ["Bug fixes & patches", "Feature additions", "Uptime monitoring", "Monthly retainers"],
    price: "From $99 / mo",
  },
];

const PROCESS_STEPS = [
  { step: "01", title: "Discovery Call", desc: "Understanding the goal, users and constraints before writing a line of code." },
  { step: "02", title: "Proposal & Scope", desc: "A clear scope, timeline and price — no surprises once work begins." },
  { step: "03", title: "Design & Build", desc: "Iterative design and development, with visible progress at every step." },
  { step: "04", title: "Launch & Support", desc: "Shipped to production, with support afterwards to keep it running." },
];

const FAQS = [
  {
    q: "How do we get started?",
    a: "Reach out through the contact form with a short brief. A discovery call follows to scope the work and agree a timeline.",
  },
  {
    q: "Do you work with fixed budgets?",
    a: "Yes — most engagements are scoped to a fixed price after the discovery call, with milestone-based payments for larger builds.",
  },
  {
    q: "Can you take over an existing codebase?",
    a: "Yes, ongoing maintenance and feature work on existing React / Node / Java codebases is a regular part of the work here.",
  },
  {
    q: "What's the typical turnaround?",
    a: "A focused landing page can ship in about a week; a full-stack product with an admin dashboard typically runs 3–6 weeks.",
  },
];


const Eyebrow = ({ children }) => <span className="sv-eyebrow">{children}</span>;

const SectionHeading = ({ eyebrow, title, subtitle, align }) => (
  <div className={`sv-heading${align === "center" ? " sv-heading--center" : ""}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="sv-heading__title">{title}</h2>
    {subtitle && <p className="sv-heading__sub">{subtitle}</p>}
  </div>
);


const Hero = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".sv-hero-tag", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(
          ".sv-hero-title span",
          { y: "110%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.9, stagger: 0.08 },
          "-=0.3"
        )
        .fromTo(".sv-hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
        .fromTo(".sv-hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="sv-hero" ref={ref}>
      <div className="sv-hero-glow" />
      <span className="sv-hero-tag sv-eyebrow">// what-i-offer</span>
      <h1 className="sv-hero-title">
        <span className="sv-line">Services built to</span>
        <span className="sv-line sv-line--accent">ship, not just demo.</span>
      </h1>
      <p className="sv-hero-sub">
        From a single landing page to a full-stack product with its own admin dashboard —
        here's how I can help you build it.
      </p>
      <div className="sv-hero-cta">
        <a href="#services-grid" className="sv-btn sv-btn--primary">
          View Services <FiArrowRight />
        </a>
        <a href="/contact" className="sv-btn sv-btn--ghost">
          Get a Quote
        </a>
      </div>
    </section>
  );
};


const ServiceCard = ({ service, index }) => {
  const Icon = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
  return (
    <div className="sv-card glass service-reveal">
      <div className="sv-card__top">
        {service.image ? (
          <img className="sv-card__image" src={resolveAssetUrl(service.image)} alt={service.title} />
        ) : (
          <div className="sv-card__icon">
            <Icon />
          </div>
        )}
        {service.price && <span className="sv-card__price">{service.price}</span>}
      </div>
      <h3 className="sv-card__title">{service.title}</h3>
      <p className="sv-card__desc">{service.description}</p>
      {Array.isArray(service.features) && service.features.length > 0 && (
        <ul className="sv-card__features">
          {service.features.slice(0, 4).map((f, i) => (
            <li key={i}>
              <FiCheck /> {f}
            </li>
          ))}
        </ul>
      )}
      <div className="sv-card__actions">
        <Link to={`/services/${service.id}`} className="sv-card__link">
          View Details <FiArrowRight />
        </Link>
        <Link to="/contact" className="sv-card__enquire">
          Enquire
        </Link>
      </div>
    </div>
  );
};

const ServicesGrid = ({ services, loading }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".service-reveal",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [loading, services]);

  return (
    <section className="services-grid-section" id="services-grid" ref={ref}>
      <SectionHeading
        eyebrow="// services"
        title="What I Build"
        subtitle="Every engagement is scoped around a real outcome — not a generic package."
        align="center"
      />

      {loading ? (
        <div className="sv-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="sv-card sv-card--skeleton glass" key={i}>
              <div className="sv-skel sv-skel--icon" />
              <div className="sv-skel sv-skel--title" />
              <div className="sv-skel sv-skel--line" />
              <div className="sv-skel sv-skel--line" style={{ width: "70%" }} />
            </div>
          ))}
        </div>
      ) : services.length ? (
        <div className="sv-grid">
          {services.map((service, i) => (
            <ServiceCard service={service} index={i} key={service.id ?? i} />
          ))}
        </div>
      ) : (
        <div className="sv-empty glass">
          <FiLayers className="sv-empty__icon" />
          <p>No services published yet — check back soon.</p>
        </div>
      )}
    </section>
  );
};


export const Process = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".sv-process-step",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 80%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="sv-process" ref={ref}>
      <SectionHeading eyebrow="// how-it-works" title="A Simple, Transparent Process" align="center" />
      <div className="sv-process-grid">
        {PROCESS_STEPS.map((s) => (
          <div className="sv-process-step glass" key={s.step}>
            <span className="sv-process-step__num">{s.step}</span>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};


export const FAQ = () => {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="sv-faq">
      <SectionHeading eyebrow="// faq" title="Common Questions" align="center" />
      <div className="sv-faq-list">
        {FAQS.map((f, i) => (
          <div className={`sv-faq-item glass${open === i ? " is-open" : ""}`} key={i}>
            <button className="sv-faq-question" onClick={() => setOpen(open === i ? -1 : i)}>
              {f.q}
              <span className="sv-faq-toggle">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && <p className="sv-faq-answer">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};


const CTASection = () => {
  const { siteSettings } = useTheme();
  const email = siteSettings?.email || "vishal.mall02@outlook.com";
  return (
    <section className="sv-cta">
      <div className="sv-cta-glow" />
      <span className="sv-eyebrow">// lets-talk</span>
      <h2 className="sv-cta-title">
        Have a project in mind?
        <br /> Let's scope it out.
      </h2>
      <p className="sv-cta-sub">Tell me what you're building — I'll reply with a clear plan and price.</p>
      <div className="sv-cta-buttons">
        <a href={`mailto:${email}`} className="sv-btn sv-btn--primary">
          Start a Project
        </a>
        <a href="/projects" className="sv-btn sv-btn--ghost">
          See Past Work
        </a>
      </div>
    </section>
  );
};


const Services = () => {
  useSeo("services", {
    title: "Services — Vishal Mall",
    description: "Full stack development services — from architecture to deployment.",
  });

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const { data, loading } = usePublicData(() => publicApi.services(), []);
  const hasServices = !loading && Array.isArray(data) && data.length;
  const services = hasServices ? data : loading ? [] : FALLBACK_SERVICES;

  return (
    <>
    <main className="services-page">
      <Navbar />
      <Hero />
      <ServicesGrid services={services} loading={loading} />
      <Process />
      <FAQ />
      <CTASection />
    </main>
    <Footer />
    </>
  );
};

export default Services;
