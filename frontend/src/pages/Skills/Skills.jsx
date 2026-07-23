import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Skills.css";
import LearningJourney from "./LearningJourney.jsx";
import Navbar from "../../components/Navbar";
import usePublicData from "../../hooks/usePublicData";
import { publicApi } from "../../lib/publicApi";
import Footer from "../../components/Footer/Footer";
import useSeo from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

/*  DATA (fallback content — used only while the CMS has nothing yet   */
/*  or the API is unreachable, so this page never renders empty)       */

const FALLBACK_FRONTEND_SKILLS = [
  { name: "HTML", tag: ".html", level: "Advanced", value: 95, desc: "Semantic, accessible markup as the foundation of every build." },
  { name: "CSS", tag: ".css", level: "Advanced", value: 92, desc: "Custom layouts and responsive systems, built without a framework crutch." },
  { name: "JavaScript", tag: ".js", level: "Advanced", value: 90, desc: "ES6+, async patterns, and clean logic that scales with the app." },
  { name: "TypeScript", tag: ".ts", level: "Intermediate", value: 75, desc: "Typed components and safer contracts across growing codebases." },
  { name: "Bootstrap", tag: ".css", level: "Advanced", value: 88, desc: "Rapid, consistent UI scaffolding for fast product iterations." },
  { name: "Tailwind CSS", tag: ".css", level: "Advanced", value: 90, desc: "Utility-first styling for speed without losing design control." },
  { name: "React", tag: ".jsx", level: "Advanced", value: 93, desc: "Component architecture, hooks, and state that scales cleanly." },
  { name: "Redux", tag: ".js", level: "Intermediate", value: 78, desc: "Predictable state management for complex application flows." },
];

const FALLBACK_BACKEND_SKILLS = [
  { name: "Java", tag: ".java", level: "Advanced", value: 90, desc: "Core language for reliable, object-oriented backend systems." },
  { name: "Spring Boot", tag: ".java", level: "Advanced", value: 85, desc: "Production-grade APIs with clean, convention-driven architecture." },
  { name: "Node.js", tag: ".js", level: "Intermediate", value: 80, desc: "Event-driven services for lightweight, fast backend logic." },
  { name: "Express.js", tag: ".js", level: "Intermediate", value: 80, desc: "Minimal routing and middleware for focused REST services." },
  { name: "JSP", tag: ".jsp", level: "Intermediate", value: 70, desc: "Server-rendered views for classic Java web applications." },
  { name: "Servlet", tag: ".java", level: "Intermediate", value: 72, desc: "Low-level request handling under the Java EE model." },
  { name: "Hibernate", tag: ".java", level: "Intermediate", value: 75, desc: "ORM mapping that keeps data access clean and maintainable." },
  { name: "REST API", tag: ".api", level: "Advanced", value: 88, desc: "Well-structured, documented endpoints built for real consumers." },
];

const FALLBACK_DATABASE_SKILLS = [
  { name: "MySQL", tag: ".sql", level: "Advanced", value: 85, desc: "Relational schema design, indexing, and query optimisation." },
  { name: "MongoDB", tag: ".db", level: "Intermediate", value: 76, desc: "Flexible document models for fast-moving product data." },
];

const FALLBACK_TOOLS = [
  { name: "Git", tag: "vcs" },
  { name: "GitHub", tag: "vcs" },
  { name: "VS Code", tag: "editor" },
  { name: "IntelliJ", tag: "editor" },
  { name: "Postman", tag: "api" },
  { name: "Figma", tag: "design" },
  { name: "Vercel", tag: "deploy" },
  { name: "Netlify", tag: "deploy" },
  { name: "AWS", tag: "learning" },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Idea", desc: "Every build starts with a clear problem worth solving." },
  { step: "02", title: "Research", desc: "Understanding users, constraints, and prior art before writing code." },
  { step: "03", title: "UI Design", desc: "Wireframes and visual language shaped in Figma." },
  { step: "04", title: "Frontend", desc: "Component architecture and interface built in React." },
  { step: "05", title: "Backend", desc: "APIs and business logic built in Java and Spring Boot." },
  { step: "06", title: "Database", desc: "Schema design across MySQL and MongoDB." },
  { step: "07", title: "Testing", desc: "Manual and automated checks before anything ships." },
  { step: "08", title: "Deployment", desc: "Shipped to production on Vercel, Netlify, or AWS." },
];

const JOURNEY_CARDS = [
  {
    year: "Year One",
    title: "Where it started",
    text: "HTML and CSS were the first real proof that typed instructions could become something visible. Static pages, then the first hover effect that actually worked.",
  },
  {
    year: "Year One",
    title: "Learning to think in logic",
    text: "JavaScript turned static pages into behaviour. Loops, functions, and the DOM became a daily vocabulary, and debugging became a skill of its own.",
  },
  {
    year: "Year Two",
    title: "Component thinking",
    text: "React reframed the entire approach to building interfaces — reusable pieces, predictable state, and a component tree that mirrors the product itself.",
  },
  {
    year: "Year Two",
    title: "Going full stack",
    text: "Java and Spring Boot opened the other half of the stack. APIs, persistence, and architecture that has to hold up outside of a browser tab.",
  },
  {
    year: "Year Three",
    title: "Building real things",
    text: "Projects stopped being exercises and started being products — end-to-end, from schema to shipped interface, built to actually be used.",
  },
  {
    year: "Ongoing",
    title: "What's next",
    text: "System design, cloud infrastructure, and the deeper architecture decisions behind software that has to scale beyond one developer.",
  },
];

const STATS = [
  { label: "Projects Completed", value: 24, suffix: "+" },
  { label: "Technologies Learned", value: 26, suffix: "+" },
  { label: "Learning Hours", value: 1200, suffix: "+" },
  { label: "Cups of Coffee", value: 900, suffix: "+" },
  { label: "Years of Experience", value: 3, suffix: "+" },
];

const WHY_ME = [
  { title: "Full-Stack Perspective", desc: "Comfortable owning a feature from database schema to the pixel that ships." },
  { title: "Detail-Obsessed", desc: "Spacing, states, and edge cases get the same attention as core functionality." },
  { title: "Fast Learner", desc: "New stacks and tools get picked up quickly, without slowing the team down." },
  { title: "Clear Communication", desc: "Progress, blockers, and trade-offs are always visible, never a surprise." },
];


const Eyebrow = ({ children }) => <span className="eyebrow">{children}</span>;

const SectionHeading = ({ eyebrow, title, subtitle, align }) => (
  <div className={`section-heading${align === "center" ? " section-heading--center" : ""}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="section-title">{title}</h2>
    {subtitle && <p className="section-subtitle">{subtitle}</p>}
  </div>
);

const SkillCard = ({ skill }) => {
  const barRef = useRef(null);

  useLayoutEffect(() => {
    const el = barRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { width: "0%" },
        {
          width: `${skill.value}%`,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [skill.value]);

  return (
    <article className="skill-card">
      <div className="skill-card__top">
        <span className="skill-card__glyph">{skill.name.slice(0, 2).toUpperCase()}</span>
        <span className="skill-card__tag">{skill.tag}</span>
      </div>
      <h3 className="skill-card__name">{skill.name}</h3>
      <p className="skill-card__desc">{skill.desc}</p>
      <div className="skill-card__footer">
        <span className="skill-card__level">{skill.level}</span>
        <span className="skill-card__value">{skill.value}%</span>
      </div>
      <div className="skill-card__track">
        <div className="skill-card__bar" ref={barRef} />
      </div>
    </article>
  );
};

const ToolChip = ({ tool }) => (
  <div className="tool-chip">
    <span className="tool-chip__dot" />
    <span className="tool-chip__name">{tool.name}</span>
    <span className="tool-chip__tag">{tool.tag}</span>
  </div>
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
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
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

const WhyCard = ({ item, index }) => {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    gsap.to(card, { rotateY: x, rotateX: y, duration: 0.5, ease: "power2.out" });
  };

  const handleLeave = () => {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
  };

  return (
    <div
      className="why-card"
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <span className="why-card__index">0{index + 1}</span>
      <h3 className="why-card__title">{item.title}</h3>
      <p className="why-card__desc">{item.desc}</p>
    </div>
  );
};


const Hero = () => {
  const heroRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-eyebrow", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo(
          ".hero-title span",
          { y: "110%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 1.1, stagger: 0.08 },
          "-=0.4"
        )
        .fromTo(".hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
        .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3");

      gsap.to(".scroll-line", {
        scaleY: 0.3,
        repeat: -1,
        yoyo: true,
        duration: 1.4,
        ease: "sine.inOut",
      });
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
        <span className="hero-eyebrow">// full-stack developer</span>
        <h1 className="hero-title">
          <span className="hero-title__line"><span>Crafting</span></span>
          <span className="hero-title__line"><span>digital experiences,</span></span>
          <span className="hero-title__line"><span>end to end.</span></span>
        </h1>
        <p className="hero-sub">
          A growing stack of frontend polish and backend discipline — from React
          interfaces to Spring Boot APIs, built with care for the details in between.
        </p>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll__label">Scroll</span>
        <span className="scroll-track">
          <span className="scroll-line" />
        </span>
      </div>
    </section>
  );
};


const AboutSkills = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-reveal",
        { y: 40, opacity: 0, filter: "blur(6px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="about-skills" ref={ref}>
      <div className="about-skills__inner">
        <p className="about-reveal about-skills__kicker">// about-my-skills.md</p>
        <h2 className="about-reveal about-skills__text">
          What began as curiosity about how a webpage worked turned into a discipline
          of building complete, reliable products — the kind that hold up under real
          use, not just in a demo.
        </h2>
        <p className="about-reveal about-skills__body">
          Every skill below has been shaped by shipping actual projects, not just
          following tutorials. The frontend brings interfaces to life; the backend
          gives them somewhere solid to stand.
        </p>
      </div>
    </section>
  );
};

/*  SKILL GRID SECTION (Frontend / Backend / Database)                 */

const SkillGridSection = ({ id, eyebrow, title, subtitle, skills }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".skill-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 78%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="skill-section" id={id} ref={ref}>
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="skill-grid">
        {skills.map((skill) => (
          <SkillCard skill={skill} key={skill.name} />
        ))}
      </div>
    </section>
  );
};


const ToolsSection = ({ tools }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tool-chip",
        { y: 24, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          ease: "back.out(1.6)",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [tools]);

  return (
    <section className="tools-section" ref={ref}>
      <SectionHeading eyebrow="// toolbelt" title="Tools" subtitle="What the daily workflow runs on." />
      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolChip tool={tool} key={tool.name} />
        ))}
      </div>
    </section>
  );
};


const WorkflowSection = () => {
  const ref = useRef(null);
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top 65%", end: "bottom 70%", scrub: 0.6 },
        }
      );

      gsap.utils.toArray(".workflow-step").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="workflow-section" ref={ref}>
      <SectionHeading eyebrow="// dev-workflow" title="Development Workflow" subtitle="The same eight steps, every time a project ships." />
      <div className="workflow-timeline">
        <div className="workflow-timeline__rail">
          <div className="workflow-timeline__fill" ref={lineRef} />
        </div>
        <div className="workflow-timeline__steps">
          {WORKFLOW_STEPS.map((s) => (
            <div className="workflow-step" key={s.step}>
              <span className="workflow-step__num">{s.step}</span>
              <div className="workflow-step__dot" />
              <div className="workflow-step__body">
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

/*  LEARNING JOURNEY — PINNED APPLE-STYLE STORYTELLING                 */




const StatsSection = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".stat-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-grid">
        {STATS.map((stat) => (
          <Counter stat={stat} key={stat.label} />
        ))}
      </div>
    </section>
  );
};

/*  WHY WORK WITH ME                                                   */

const WhySection = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".why-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 78%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="why-section" ref={ref}>
      <SectionHeading eyebrow="// why-work-with-me" title="Why Work With Me" align="center" />
      <div className="why-grid">
        {WHY_ME.map((item, i) => (
          <WhyCard item={item} index={i} key={item.title} />
        ))}
      </div>
    </section>
  );
};


const CTASection = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cta-reveal",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%" },
        }
      );
      gsap.to(".cta-glow", {
        x: 60,
        y: -30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="cta-section" ref={ref}>
      <div className="cta-glow" />
      <span className="cta-reveal eyebrow">// lets-talk</span>
      <h2 className="cta-reveal cta-title">
        Let&rsquo;s Build Something
        <br /> Amazing Together
      </h2>
      <p className="cta-reveal cta-sub">
        Have a product idea, a role, or a hard problem worth solving? Start there.
      </p>
      <a href="#contact" className="cta-reveal cta-button">
        <span>Start a conversation</span>
        <span className="cta-button__arrow">&rarr;</span>
      </a>
    </section>
  );
};


const levelFromProficiency = (value) => {
  if (value >= 85) return "Advanced";
  if (value >= 60) return "Intermediate";
  return "Beginner";
};

const mapSkillRow = (row) => ({
  name: row.name,
  tag: row.icon || "",
  level: levelFromProficiency(row.proficiency),
  value: row.proficiency,
  desc: "",
});

const mapToolRow = (row) => ({
  name: row.name,
  tag: row.icon || (row.category ? row.category.toLowerCase() : ""),
});

const Skills = () => {
  useSeo("skills", {
    title: "Skills — Vishal Mall",
    description: "Technical skills across frontend, backend, database and tooling.",
  });

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const { data: skillsData, loading } = usePublicData(() => publicApi.skills(), []);
  const hasSkills = !loading && Array.isArray(skillsData) && skillsData.length;

  // Group dynamically by whatever `category` the admin has actually set on
  // each skill — no fixed list of allowed categories. "Tools" (any casing)
  // is special-cased to the icon-chip layout; every other category name
  // (DevOps, Cloud, Testing, AI, Mobile, Programming Language, Others, ...)
  // automatically gets its own skill-grid section.
  const categorized = useMemo(() => {
    if (!hasSkills) return null;
    const map = new Map();
    skillsData.forEach((row) => {
      const key = (row.category || "Other").trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return map;
  }, [hasSkills, skillsData]);

  const toolsCategoryKey = categorized
    ? Array.from(categorized.keys()).find((key) => key.toLowerCase() === "tools")
    : null;

  const dynamicSkillCategories = categorized
    ? Array.from(categorized.entries()).filter(([key]) => key !== toolsCategoryKey)
    : [];

  const tools = toolsCategoryKey ? categorized.get(toolsCategoryKey).map(mapToolRow) : FALLBACK_TOOLS;

  return (
    <>
    <main className="skills-page">
      <Navbar />
      <Hero />
      <AboutSkills />
      {dynamicSkillCategories.length > 0 ? (
        dynamicSkillCategories.map(([category, rows]) => (
          <SkillGridSection
            key={category}
            id={category.toLowerCase().replace(/\s+/g, "-")}
            eyebrow={`// ${category.toLowerCase()}`}
            title={`${category} Skills`}
            subtitle="Managed live from the Admin Panel."
            skills={rows.map(mapSkillRow)}
          />
        ))
      ) : (
        <>
          <SkillGridSection
            id="frontend"
            eyebrow="// frontend"
            title="Frontend Skills"
            subtitle="The layer people actually see and feel."
            skills={FALLBACK_FRONTEND_SKILLS}
          />
          <SkillGridSection
            id="backend"
            eyebrow="// backend"
            title="Backend Skills"
            subtitle="The logic and services running underneath."
            skills={FALLBACK_BACKEND_SKILLS}
          />
          <SkillGridSection
            id="database"
            eyebrow="// database"
            title="Database"
            subtitle="Where the data actually lives."
            skills={FALLBACK_DATABASE_SKILLS}
          />
        </>
      )}
      <ToolsSection tools={tools} />
      <WorkflowSection />
      <LearningJourney />
      <StatsSection />
      <WhySection />
      <CTASection />
    </main>
    <Footer />
    </>
  );
};

export default Skills;
