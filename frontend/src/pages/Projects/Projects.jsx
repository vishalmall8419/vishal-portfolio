import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Projects.css";
import Navbar from "../../components/Navbar";
import usePublicData from "../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import Footer from "../../components/Footer/Footer";
import useTheme from "../../hooks/useTheme";
import useSeo from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

/*  DATA (fallback content — used only while the CMS has nothing yet   */
/*  or the API is unreachable, so this page never renders empty)       */

const FALLBACK_FEATURED_PROJECTS = [
  {
    category: "E-Commerce Platform",
    title: "Nexus Commerce",
    description:
      "A full-stack storefront built for real traffic — product catalog, cart, checkout, and an admin dashboard, backed by a Spring Boot API and a MySQL data layer.",
    tech: ["React", "Redux", "Java", "Spring Boot", "MySQL"],
    features: [
      "Role-based admin and customer dashboards",
      "Real-time inventory and order tracking",
      "Secure checkout with saved payment methods",
      "Search and filtering across the full catalog",
    ],
    status: "Live",
    timeline: "Jan 2024 — Mar 2024",
    role: "Full Stack Developer",
    demoHref: "#",
    githubHref: "#",
    initials: "NC",
  },
  {
    category: "SaaS Productivity",
    title: "TaskFlow",
    description:
      "A team task and sprint management tool with drag-and-drop boards, activity timelines, and live updates powered by a Node.js and Express backend.",
    tech: ["React", "Node.js", "Express.js", "MongoDB"],
    features: [
      "Drag-and-drop kanban boards",
      "Real-time activity feed per project",
      "Custom sprint views and due-date tracking",
      "Team roles and granular permissions",
    ],
    status: "In Progress",
    timeline: "Jun 2024 — Present",
    role: "Full Stack Developer",
    demoHref: "#",
    githubHref: "#",
    initials: "TF",
  },
  {
    category: "Campus Community",
    title: "CampusConnect",
    description:
      "A campus-wide platform connecting students to clubs, events, and study groups, built on a Java and Spring Boot backend with a MySQL schema.",
    tech: ["React", "Java", "Spring Boot", "MySQL"],
    features: [
      "Event discovery with RSVP and reminders",
      "Club pages with membership management",
      "Study-group matching by course and schedule",
      "Notification system for campus announcements",
    ],
    status: "Completed",
    timeline: "Sep 2023 — Dec 2023",
    role: "Full Stack Developer",
    demoHref: "#",
    githubHref: "#",
    initials: "CC",
  },
];

const FALLBACK_SHOWCASE_PROJECTS = [
  { title: "Portfolio Engine", tag: "React · GSAP", initials: "PE" },
  { title: "Weather Dashboard", tag: "React · REST API", initials: "WD" },
  { title: "Realtime Chat App", tag: "Node.js · Socket", initials: "RC" },
  { title: "Blog CMS", tag: "Java · Spring Boot", initials: "BC" },
  { title: "URL Shortener", tag: "Node.js · MongoDB", initials: "US" },
  { title: "Expense Tracker", tag: "React · MySQL", initials: "ET" },
];

const PROCESS_STEPS = [
  { step: "01", title: "Idea", desc: "Starting from a problem worth solving." },
  { step: "02", title: "Research", desc: "Studying users, constraints, and prior art." },
  { step: "03", title: "Planning", desc: "Scoping architecture and milestones." },
  { step: "04", title: "UI Design", desc: "Shaping the experience in Figma." },
  { step: "05", title: "Frontend", desc: "Building the interface in React." },
  { step: "06", title: "Backend", desc: "APIs and logic in Java and Spring Boot." },
  { step: "07", title: "Database", desc: "Schema design across MySQL and MongoDB." },
  { step: "08", title: "Testing", desc: "Manual and automated checks before ship." },
  { step: "09", title: "Deployment", desc: "Shipped to production and monitored." },
];

const FALLBACK_TECH_GROUPS = [
  { group: "Frontend", items: ["React", "JavaScript", "TypeScript", "CSS", "Tailwind CSS", "Bootstrap"] },
  { group: "Backend", items: ["Java", "Spring Boot", "Node.js", "Express.js"] },
  { group: "Database", items: ["MySQL", "MongoDB"] },
  { group: "Tools", items: ["Git", "GitHub", "Postman", "Figma"] },
  { group: "Deployment", items: ["Vercel", "Netlify", "AWS"] },
];

const CHALLENGES = [
  {
    challenge: "Handling real-time state across a large component tree.",
    solution: "Introduced Redux with normalised state and selective memoisation.",
    result: "A measurable drop in unnecessary re-renders across the app.",
  },
  {
    challenge: "Slow API responses under concurrent load.",
    solution: "Added a caching layer and optimised the underlying database indexes.",
    result: "Response times cut by more than half during peak traffic.",
  },
  {
    challenge: "Inconsistent UI across breakpoints and devices.",
    solution: "Rebuilt the design system around fluid spacing and typography tokens.",
    result: "One consistent design language, from mobile to widescreen.",
  },
];

const STATS = [
  { label: "Projects Completed", value: 24, suffix: "+" },
  { label: "GitHub Repositories", value: 30, suffix: "+" },
  { label: "Lines of Code", value: 50000, suffix: "+" },
  { label: "Technologies Used", value: 26, suffix: "+" },
  { label: "Happy Clients", value: 12, suffix: "+" },
  { label: "Learning Hours", value: 1500, suffix: "+" },
];

const FUTURE_PROJECTS = [
  { tag: "AI Project", status: "In Research", title: "AI Resume Analyzer", desc: "An AI-assisted tool that reviews resumes against a target role and suggests concrete improvements." },
  { tag: "Open Source", status: "Planned", title: "Open Component Library", desc: "A reusable, framework-agnostic UI component library built from patterns used across past projects." },
  { tag: "Civic Tech", status: "In Progress", title: "GramNirman", desc: "A civic-tech platform connecting rural communities to development resources, local reporting, and progress tracking." },
  { tag: "Startup Concept", status: "Planned", title: "SaaS Analytics Starter", desc: "A boilerplate analytics dashboard product aimed at early-stage SaaS teams needing fast insight." },
];

const FALLBACK_TESTIMONIALS = [
  { quote: "Clear updates, clean code, and it shipped on time — exactly what a fast-moving team needs.", name: "Demo Reviewer", role: "Sample Testimonial" },
  { quote: "The attention to small details made the whole product feel far more polished than expected.", name: "Demo Reviewer", role: "Sample Testimonial" },
  { quote: "Handed off a rough idea and got back something that felt genuinely thought through.", name: "Demo Reviewer", role: "Sample Testimonial" },
];




const Eyebrow = ({ children }) => <span className="pr-eyebrow">{children}</span>;

const SectionHeading = ({ eyebrow, title, subtitle, align }) => (
  <div className={`pr-heading${align === "center" ? " pr-heading--center" : ""}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="pr-heading__title">{title}</h2>
    {subtitle && <p className="pr-heading__sub">{subtitle}</p>}
  </div>
);

const useTilt = (strength = 8) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    const card = ref.current;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -strength;
    gsap.to(card, { rotateY: x, rotateX: y, duration: 0.5, ease: "power2.out" });
  };
  const handleLeave = () => {
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
  };
  return { ref, handleMove, handleLeave };
};


const Hero = () => {
  const heroRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-tag", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(
          ".hero-title span",
          { y: "110%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 1.1, stagger: 0.07 },
          "-=0.3"
        )
        .fromTo(".hero-sub", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.6")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
        .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");

      gsap.to(".scroll-line", { scaleY: 0.3, repeat: -1, yoyo: true, duration: 1.4, ease: "sine.inOut" });
    }, heroRef);

    const handleMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      gsap.to(orbARef.current, { x: x * 40, y: y * 30, duration: 1.2, ease: "power2.out" });
      gsap.to(orbBRef.current, { x: x * -30, y: y * -20, duration: 1.4, ease: "power2.out" });
    };
    window.addEventListener("mousemove", handleMove);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-orb hero-orb--a" ref={orbARef} />
      <div className="hero-orb hero-orb--b" ref={orbBRef} />
      <div className="hero-grid" />

      <div className="hero-content">
        <span className="hero-tag">// selected-work</span>
        <h1 className="hero-title">
          <span className="hero-title__line"><span>Projects that went</span></span>
          <span className="hero-title__line"><span>past the tutorial.</span></span>
        </h1>
        <p className="hero-sub">
          A collection of full-stack products, experiments, and tools — each one
          built, shipped, and shaped by real constraints.
        </p>
        <a href="#featured" className="hero-cta">
          <span>Explore the work</span>
          <span className="hero-cta__arrow">&darr;</span>
        </a>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll__label">Scroll</span>
        <span className="scroll-track"><span className="scroll-line" /></span>
      </div>
    </section>
  );
};


const FeaturedCard = React.memo(({ project, index }) => {
  const ref = useRef(null);
  const fromLeft = index % 2 === 0;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { x: fromLeft ? -60 : 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );

      gsap.fromTo(
        ref.current.querySelectorAll(".feature-tag"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 70%" } }
      );
    }, ref);

    return () => ctx.revert();
  }, [fromLeft]);

  const statusClass =
    project.status === "Live"
      ? "is-live"
      : project.status === "In Progress"
      ? "is-progress"
      : "is-complete";

  return (
    <article className={`featured-card${fromLeft ? "" : " is-reversed"}`} ref={ref}>
      <div className="featured-card__visual">
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="featured-card__image"
            loading="lazy"
          />
        ) : (
          <span className="featured-card__initials">{project.initials}</span>
        )}

        <span className={`featured-card__status ${statusClass}`}>
          {project.status}
        </span>
      </div>

      <div className="featured-card__body glass">
        <span className="featured-card__category">{project.category}</span>

        <h3 className="featured-card__title">{project.title}</h3>

        <p className="featured-card__desc">{project.description}</p>

        <div className="featured-card__tech">
          {project.tech.map((t) => (
            <span className="feature-tag" key={t}>
              {t}
            </span>
          ))}
        </div>

        <ul className="featured-card__features">
          {project.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <div className="featured-card__meta">
          <div>
            <span className="featured-card__meta-label">Timeline</span>
            <span className="featured-card__meta-value">
              {project.timeline}
            </span>
          </div>

          <div>
            <span className="featured-card__meta-label">Role</span>
            <span className="featured-card__meta-value">
              {project.role}
            </span>
          </div>
        </div>

        <div className="featured-card__actions">
          <Link
            to={`/projects/${project.slug}`}
            className="pr-btn pr-btn--primary"
          >
            View Details
          </Link>

          {project.demoHref !== "#" && (
            <a
              href={project.demoHref}
              target="_blank"
              rel="noreferrer"
              className="pr-btn pr-btn--ghost"
            >
              Live Demo
            </a>
          )}

          {project.githubHref !== "#" && (
            <a
              href={project.githubHref}
              target="_blank"
              rel="noreferrer"
              className="pr-btn pr-btn--ghost"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  );
});

const FeaturedProjects = ({ projects }) => {
  return (
    <section className="featured-section" id="featured">
      <SectionHeading
        eyebrow="// featured-projects"
        title="Featured Projects"
        subtitle="The ones built end to end, start to ship."
      />

      <div className="featured-list">
        {projects.map((project, i) => (
          <FeaturedCard
            key={project.title}
            project={project}
            index={i}
          />
        ))}
      </div>
    </section>
  );
};

const ShowcaseCard = React.memo(({ project }) => {
  const { ref, handleMove, handleLeave } = useTilt(10);
  return (
    <div className="showcase-card" ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="showcase-card__glow" />
      <div className="showcase-card__visual">
        {project.image ? (
          <img src={project.image} alt={project.title} className="showcase-card__image" loading="lazy" />
        ) : (
          <span>{project.initials}</span>
        )}
      </div>
      <div className="showcase-card__info">
        <h3>{project.title}</h3>
        <p>{project.tag}</p>
      </div>
    </div>
  );
});

const ProjectShowcase = ({ projects }) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".showcase-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 80%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, [projects]);

  if (!projects.length) return null;

  return (
    <section className="showcase-section" ref={ref}>
      <SectionHeading eyebrow="// project-showcase" title="Project Showcase" subtitle="Smaller builds, same amount of care." />
      <div className="showcase-grid">
        {projects.map((p) => (
          <ShowcaseCard project={p} key={p.title} />
        ))}
      </div>
    </section>
  );
};


const DevelopmentProcess = () => {
  const ref = useRef(null);
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: ref.current, start: "top 70%", end: "bottom 65%", scrub: 0.6 } }
      );
      gsap.utils.toArray(".process-step").forEach((step) => {
        gsap.fromTo(
          step,
          { x: -40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 84%" } }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="process-section" ref={ref}>
      <SectionHeading eyebrow="// development-process" title="Development Process" subtitle="The same nine steps, on every build." />
      <div className="process-timeline">
        <div className="process-timeline__rail">
          <div className="process-timeline__fill" ref={lineRef} />
        </div>
        <div className="process-timeline__steps">
          {PROCESS_STEPS.map((s) => (
            <div className="process-step" key={s.step}>
              <span className="process-step__num">{s.step}</span>
              <div className="process-step__dot" />
              <div className="process-step__body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


const TechUsage = ({ groups }) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tech-group",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, [groups]);

  return (
    <section className="tech-section" ref={ref}>
      <SectionHeading eyebrow="// technology-usage" title="Technology Usage" subtitle="Grouped by where each piece sits in the stack." />
      <div className="tech-groups">
        {groups.map((group) => (
          <div className="tech-group glass" key={group.group}>
            <h3 className="tech-group__title">{group.group}</h3>
            <div className="tech-group__items">
              {group.items.map((item) => (
                <span className="tech-chip" key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


const ChallengeCard = ({ item }) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 82%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="challenge-card glass" ref={ref}>
      <div className="challenge-row">
        <span className="challenge-label is-challenge">Challenge</span>
        <p>{item.challenge}</p>
      </div>
      <span className="challenge-arrow">&darr;</span>
      <div className="challenge-row">
        <span className="challenge-label is-solution">Solution</span>
        <p>{item.solution}</p>
      </div>
      <span className="challenge-arrow">&darr;</span>
      <div className="challenge-row">
        <span className="challenge-label is-result">Result</span>
        <p>{item.result}</p>
      </div>
    </div>
  );
};

const ChallengesSection = () => (
  <section className="challenges-section">
    <SectionHeading eyebrow="// challenges-and-solutions" title="Challenges & Solutions" align="center" />
    <div className="challenges-grid">
      {CHALLENGES.map((item) => (
        <ChallengeCard item={item} key={item.challenge} />
      ))}
    </div>
  </section>
);


const Counter = ({ stat }) => {
  const numRef = useRef(null);
  useLayoutEffect(() => {
    const el = numRef.current;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: stat.value,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toLocaleString() + stat.suffix;
        },
      });
    });
    return () => ctx.revert();
  }, [stat]);

  return (
    <div className="stat-card">
      <span className="stat-card__value" ref={numRef}>0{stat.suffix}</span>
      <span className="stat-card__label">{stat.label}</span>
    </div>
  );
};

const StatsSection = ({ stats }) => {
  const items = stats
    ? [
      { label: "Completed Projects", value: stats.totalProjects ?? 20, suffix: "+" },
      { label: "Ongoing Projects", value: stats.ongoingProjects ?? 2, suffix: "+" },
      { label: "Happy Clients", value: stats.happyClients ?? 10, suffix: "+" },
      { label: "Technologies Used", value: stats.technologies ?? 15, suffix: "+" },
      { label: "Open Source Projects", value: stats.openSourceProjects ?? 3, suffix: "+" },
      { label: "Years Experience", value: stats.yearsExperience ?? 2, suffix: "+" },
    ]
    : STATS;

  return (
    <section className="stats-section">
      <SectionHeading eyebrow="// project-statistics" title="Project Statistics" align="center" />
      <div className="stats-grid">
        {items.map((stat) => (
          <Counter stat={stat} key={stat.label} />
        ))}
      </div>
    </section>
  );
};


const FutureCard = ({ item }) => {
  const { ref, handleMove, handleLeave } = useTilt(6);
  return (
    <div className="future-card glass" ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="future-card__top">
        <span className="future-card__tag">{item.tag}</span>
        <span className="future-card__status">{item.status}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
    </div>
  );
};

const FutureProjects = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".future-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="future-section" ref={ref}>
      <SectionHeading eyebrow="// future-projects" title="Future Projects" subtitle="What's on the roadmap next." align="center" />
      <div className="future-grid">
        {FUTURE_PROJECTS.map((item) => (
          <FutureCard item={item} key={item.title} />
        ))}
      </div>
    </section>
  );
};


const Testimonials = ({ testimonials, isFallback }) => {
  const ref = useRef(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonial-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );
    }, ref);

    const interval = setInterval(() => {
      setActive((prev) => (testimonials.length ? (prev + 1) % testimonials.length : 0));
    }, 4000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, [testimonials]);

  return (
    <section className="testimonials-section" ref={ref}>
      <SectionHeading
        eyebrow="// testimonials"
        title="Testimonials"
        subtitle={isFallback ? "Sample content — real feedback in progress." : "Real feedback from people I've worked with."}
        align="center"
      />
      <div className="testimonials-grid">
        {testimonials.map((t, i) => (
          <div className={`testimonial-card glass${i === active ? " is-active" : ""}`} key={t.name + i}>
            <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-author">
              <span className="testimonial-author__name">{t.name}</span>
              <span className="testimonial-author__role">{t.role}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="testimonials-dots">
        {testimonials.map((_, i) => (
          <span key={i} className={`testimonials-dot${i === active ? " is-active" : ""}`} />
        ))}
      </div>
    </section>
  );
};


const CTASection = () => {
  const ref = useRef(null);
  const { siteSettings } = useTheme();
  const email = siteSettings?.email || "vishal.mall02@outlook.com";
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-reveal",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 80%" } }
      );
      gsap.to(".cta-glow", { x: 60, y: -30, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cta-section">
      <div className="cta-glow" />
      <span className="cta-reveal pr-eyebrow">// lets-talk</span>
      <h2 className="cta-reveal cta-title">
        Have an Idea?
        <br /> Let&rsquo;s Build It Together.
      </h2>
      <p className="cta-reveal cta-sub">
        Bring the problem — the architecture, the interface, and the launch plan
        can be figured out together.
      </p>
      <div className="cta-reveal cta-buttons">
        <a href={`mailto:${email}`} className="pr-btn pr-btn--primary">Start a Project</a>
        <a href="#featured" className="pr-btn pr-btn--ghost">View Projects</a>
      </div>
    </section>
  );
};

/*  API DATA MAPPING                                                    */
/*  Reuses the existing /public/projects, /public/skills and            */
/*  /public/testimonials endpoints — no new backend routes required.    */

const formatMonthYear = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const initialsFromTitle = (title = "") =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "PR";

const mapProjectToFeatured = (project) => ({
  slug: project.slug || project.id,
  category: project.category || "Project",
  title: project.title,
  description: project.shortDescription || project.description || "",
  tech: Array.isArray(project.technologies) ? project.technologies : [],
  features: [],
  status: project.liveUrl ? "Live" : "Completed",
  timeline: formatMonthYear(project.createdAt) || "—",
  role: "Full Stack Developer",
  demoHref: project.liveUrl || "#",
  githubHref: project.githubUrl || "#",
  image: resolveAssetUrl(project.image),
  initials: initialsFromTitle(project.title),
});

const mapProjectToShowcase = (project) => ({
  title: project.title,
  tag:
    Array.isArray(project.technologies) && project.technologies.length
      ? project.technologies.slice(0, 2).join(" · ")
      : project.category || "Project",
  image: resolveAssetUrl(project.image),
  initials: initialsFromTitle(project.title),
});

const groupSkillsByCategory = (rows) => {
  const groups = new Map();
  rows.forEach((row) => {
    const key = row.category || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row.name);
  });
  return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
};

const mapTestimonial = (row) => ({
  quote: row.review,
  name: row.name,
  role: row.designation || "Client",
});


const Projects = () => {
  useSeo("projects", {
    title: "Projects — Vishal Mall",
    description: "A showcase of full-stack projects built with Java, React, Spring Boot, Node.js and MySQL.",
  });

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const { data: projectsData, loading: projectsLoading } = usePublicData(() => publicApi.projects(), []);
  const { data: skillsData, loading: skillsLoading } = usePublicData(() => publicApi.skills(), []);
  const { data: testimonialsData, loading: testimonialsLoading } = usePublicData(() => publicApi.testimonials(), []);
  const { data: settingsData } = usePublicData(() => publicApi.settings(), []);

  const hasProjects = !projectsLoading && Array.isArray(projectsData) && projectsData.length;
  const featuredProjects = useMemo(
    () => (hasProjects ? projectsData.slice(0, 3).map(mapProjectToFeatured) : FALLBACK_FEATURED_PROJECTS),
    [hasProjects, projectsData]
  );
  const showcaseProjects = useMemo(
    () => (hasProjects ? projectsData.slice(3).map(mapProjectToShowcase) : FALLBACK_SHOWCASE_PROJECTS),
    [hasProjects, projectsData]
  );

  const hasSkills = !skillsLoading && Array.isArray(skillsData) && skillsData.length;
  const techGroups = useMemo(
    () => (hasSkills ? groupSkillsByCategory(skillsData) : FALLBACK_TECH_GROUPS),
    [hasSkills, skillsData]
  );

  const hasTestimonials = !testimonialsLoading && Array.isArray(testimonialsData) && testimonialsData.length;
  const testimonials = useMemo(
    () => (hasTestimonials ? testimonialsData.map(mapTestimonial) : FALLBACK_TESTIMONIALS),
    [hasTestimonials, testimonialsData]
  );

  // The sections above each set up their own ScrollTrigger instances on
  // mount, before the async project/skills/testimonials data has arrived.
  // Once real data swaps in and changes each section's height, those
  // trigger positions go stale -- most visibly, the Footer's reveal
  // animation (triggered at "top 92%" of the viewport) ends up computed
  // against the old (shorter) layout and never fires, leaving the footer
  // stuck at opacity 0. Refreshing once everything has settled recomputes
  // every trigger against the final layout.
  useEffect(() => {
    if (projectsLoading || skillsLoading || testimonialsLoading) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [projectsLoading, skillsLoading, testimonialsLoading]);

  return (
    <>
      <main className="projects-page">
        <Navbar />
        <Hero />
        <FeaturedProjects projects={featuredProjects} />
        <ProjectShowcase projects={showcaseProjects} />
        <DevelopmentProcess />
        <TechUsage groups={techGroups} />
        <ChallengesSection />
        <StatsSection stats={settingsData?.stats} />
        <FutureProjects />
        <Testimonials testimonials={testimonials} isFallback={!hasTestimonials} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

export default Projects;
