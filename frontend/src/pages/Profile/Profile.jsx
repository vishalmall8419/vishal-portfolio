import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Profile.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import profileImg from "../../assets/images/profile/hero.webp";
import usePublicData from "../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import useTheme from "../../hooks/useTheme";
import useSeo from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

/*  DATA (fallback content — used only while Settings has nothing yet  */
/*  or the API is unreachable, so this page never renders empty)       */

const FALLBACK_PERSONAL_INFO = [
  { label: "Name", value: "Vishal Mall" },
  { label: "Role", value: "Full Stack Developer" },
  { label: "Location", value: "Lucknow, India" },
  { label: "Phone", value: "+91 8419073041" },
  { label: "Experience", value: "3+ Years" },
  { label: "Education", value: "B.Tech, Computer Science" },
  { label: "Languages", value: "English, Hindi" },
  { label: "Email", value: "vishal.mall02@outlook.com" },
  { label: "Availability", value: "Open to opportunities" },
  { label: "Freelance", value: "Available" },
];

const CAREER_JOURNEY = [
  {
    tag: "Education",
    year: "2021",
    title: "B.Tech in Computer Science",
    desc: "Built the foundation — data structures, algorithms, and the first real taste of how software is designed.",
  },
  {
    tag: "Learning",
    year: "2022",
    title: "Self-taught web fundamentals",
    desc: "HTML, CSS, and JavaScript outside the classroom, driven by curiosity more than any syllabus.",
  },
  {
    tag: "Projects",
    year: "2023",
    title: "First full-stack applications",
    desc: "React on the frontend, Java and Spring Boot underneath — the first products built start to finish.",
  },
  {
    tag: "Professional Growth",
    year: "2024",
    title: "Real-world codebases",
    desc: "Working within larger systems, existing conventions, and the discipline that comes with shipping to real users.",
  },
  {
    tag: "Current Goals",
    year: "2025 — now",
    title: "System design and cloud",
    desc: "Going deeper into architecture, scalability, and the infrastructure that sits behind reliable software.",
  },
];

const STATS = [
  { label: "Projects Completed", value: 24, suffix: "+" },
  { label: "Technologies Learned", value: 26, suffix: "+" },
  { label: "GitHub Commits", value: 1200, suffix: "+" },
  { label: "Certificates", value: 8, suffix: "+" },
  { label: "Hours of Learning", value: 1500, suffix: "+" },
  { label: "Years of Coding", value: 3, suffix: "+" },
];

const STRENGTHS = [
  { title: "Problem Solving", desc: "Breaking complex issues into small, solvable pieces before writing a line of code." },
  { title: "Clean Code", desc: "Readable, consistent, and built to be maintained by someone else — or by future me." },
  { title: "UI Design", desc: "An eye for spacing, hierarchy, and interfaces that feel obvious to use." },
  { title: "Backend Development", desc: "APIs and data models engineered to hold up under real traffic." },
  { title: "Team Collaboration", desc: "Comfortable in code reviews, standups, and shared ownership of a codebase." },
  { title: "Quick Learning", desc: "New frameworks and tools get absorbed fast, without slowing a team down." },
  { title: "Communication", desc: "Progress, blockers, and trade-offs stay visible — never a surprise." },
  { title: "Creative Thinking", desc: "Approaching familiar problems from angles a tutorial never covers." },
];

const WORKFLOW_STEPS = [
  { step: "01", title: "Research", desc: "Understanding the problem before touching an editor." },
  { step: "02", title: "Planning", desc: "Structuring the approach, scope, and architecture." },
  { step: "03", title: "Design", desc: "Shaping the interface and experience in Figma." },
  { step: "04", title: "Development", desc: "Building it in React, Java, and Spring Boot." },
  { step: "05", title: "Testing", desc: "Checking edge cases before anything ships." },
  { step: "06", title: "Deployment", desc: "Shipping to production and watching it work." },
];

const FUN_FACTS = [
  { title: "Coffee Lover", desc: "Most late-night debugging runs on a fresh cup." },
  { title: "Open Source Enthusiast", desc: "Reading other people's code is half the education." },
  { title: "Always Learning", desc: "There's usually a course or doc tab open somewhere." },
  { title: "Night Coder", desc: "Some of the best focus happens after midnight." },
  { title: "Problem Solver", desc: "A hard bug is just a puzzle that hasn't been solved yet." },
  { title: "Tech Explorer", desc: "New tools and frameworks get a test drive before anyone asks." },
];

const CURRENT_FOCUS = ["React", "Node.js", "Java", "Spring Boot", "GSAP", "System Design", "AWS", "AI Tools"];


const Eyebrow = ({ children }) => <span className="p-eyebrow">{children}</span>;

const SectionHeading = ({ eyebrow, title, subtitle, align }) => (
  <div className={`p-heading${align === "center" ? " p-heading--center" : ""}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="p-heading__title">{title}</h2>
    {subtitle && <p className="p-heading__sub">{subtitle}</p>}
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

const StrengthCard = ({ item, index }) => {
  const cardRef = useRef(null);

  const handleMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    gsap.to(card, { rotateY: x, rotateX: y, duration: 0.5, ease: "power2.out" });
  };

  const handleLeave = () => {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
  };

  return (
    <div className="strength-card" ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <span className="strength-card__index">0{index + 1}</span>
      <h3 className="strength-card__title">{item.title}</h3>
      <p className="strength-card__desc">{item.desc}</p>
    </div>
  );
};

const FunFactCard = ({ item }) => (
  <div className="fact-card">
    <div className="fact-card__inner">
      <div className="fact-card__face fact-card__face--front">
        <h3>{item.title}</h3>
      </div>
      <div className="fact-card__face fact-card__face--back">
        <p>{item.desc}</p>
      </div>
    </div>
  </div>
);


const Hero = () => {
  const heroRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const avatarRef = useRef(null);
  const { siteSettings } = useTheme();
  const avatarSrc = resolveAssetUrl(siteSettings?.avatar) || profileImg;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-avatar", { scale: 0.85, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.1 })
        .fromTo(".hero-tag", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
        .fromTo(
          ".hero-name span",
          { y: "110%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 1, stagger: 0.06 },
          "-=0.3"
        )
        .fromTo(".hero-role", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
        .fromTo(".hero-sub", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5")
        .fromTo(".hero-cta", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .fromTo(".hero-scroll", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2");

      gsap.to(".scroll-line", { scaleY: 0.3, repeat: -1, yoyo: true, duration: 1.4, ease: "sine.inOut" });
      gsap.to(".hero-avatar__ring", { rotate: 360, duration: 24, repeat: -1, ease: "none" });
    }, heroRef);

    const handleMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      gsap.to(orbARef.current, { x: x * 40, y: y * 30, duration: 1.2, ease: "power2.out" });
      gsap.to(orbBRef.current, { x: x * -30, y: y * -20, duration: 1.4, ease: "power2.out" });
      gsap.to(avatarRef.current, { x: x * 10, y: y * 10, duration: 1, ease: "power2.out" });
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

      <div className="hero-avatar" ref={avatarRef}>
        <span className="hero-avatar__ring" />
        <div className="hero-avatar__badge">
          <img src={avatarSrc} alt="Profile" />
        </div>
      </div>

      <span className="hero-tag">// full-stack developer &middot; {(siteSettings?.address || "lucknow, india").toLowerCase()}</span>

      <h1 className="hero-name">
        <span className="hero-name__line"><span>{siteSettings?.name || "Vishal Mall"}</span></span>
      </h1>

      <p className="hero-role">{siteSettings?.role || "Full Stack Developer"}</p>

      <p className="hero-sub">
        Building end-to-end products with React on the surface and Java, Spring
        Boot underneath — with an obsession for the details in between.
      </p>

      <div className="hero-cta-row">
        <a href="#work" className="hero-cta hero-cta--primary">View My Work</a>
        <a href="#contact" className="hero-cta hero-cta--ghost">Get In Touch</a>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll__label">Scroll</span>
        <span className="scroll-track"><span className="scroll-line" /></span>
      </div>
    </section>
  );
};


const AboutMe = ({ settings }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-col-text > *",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 75%" } }
      );
      gsap.fromTo(
        ".about-panel",
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 70%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="about-me" ref={ref}>
      <div className="about-me__grid">
        <div className="about-col-text">
          <Eyebrow>// about-me</Eyebrow>
          <h2 className="about-me__title">
            I build software that feels as good to use as it is engineered to run.
          </h2>
          <p className="about-me__para">
            What started as curiosity about how a webpage worked turned into a
            genuine discipline — learning to reason through problems, not just
            memorise syntax. That curiosity is still the engine behind every
            project.
          </p>
          <p className="about-me__para">
            {settings?.careerObjective || (
              <>
                I care about the full picture: an interface that feels intuitive, an
                API that holds up under real load, and a codebase someone else could
                actually maintain. My goal isn&rsquo;t just to ship — it&rsquo;s to ship
                things worth shipping.
              </>
            )}
          </p>
          <p className="about-me__para">
            Outside of features and deadlines, I enjoy building small tools,
            exploring new frameworks before they&rsquo;re mainstream, and slowly
            working toward the kind of engineer who can own a problem end to end.
          </p>
        </div>

        <div className="about-panel glass">
          <div className="about-panel__row">
            <span className="about-panel__label">Who I am</span>
            <p>A full-stack developer who enjoys both sides of the stack equally.</p>
          </div>
          <div className="about-panel__row">
            <span className="about-panel__label">My passion</span>
            <p>Turning ambiguous ideas into interfaces and systems that work.</p>
          </div>
          <div className="about-panel__row">
            <span className="about-panel__label">My journey</span>
            <p>Self-driven, project-first, always one step past the tutorial.</p>
          </div>
          <div className="about-panel__row">
            <span className="about-panel__label">My goals</span>
            <p>Deeper system design, cloud fluency, and products used at scale.</p>
          </div>
        </div>
      </div>
    </section>
  );
};


const PersonalInfo = ({ info }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".info-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 80%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="personal-info" ref={ref}>
      <SectionHeading eyebrow="// personal-info" title="Personal Information" />
      <div className="info-grid">
        {info.map((item) => (
          <div className="info-card glass" key={item.label}>
            <span className="info-card__label">{item.label}</span>
            <span className="info-card__value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};


const CareerJourney = () => {
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

      gsap.utils.toArray(".journey-milestone").forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { x: fromLeft ? -50 : 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%" } }
        );
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="career" ref={ref}>
      <SectionHeading eyebrow="// career-journey" title="Career Journey" subtitle="Every milestone that led here." align="center" />
      <div className="career-timeline">
        <div className="career-timeline__rail">
          <div className="career-timeline__fill" ref={lineRef} />
        </div>
        {CAREER_JOURNEY.map((item, i) => (
          <div className={`journey-milestone${i % 2 === 0 ? " is-left" : " is-right"}`} key={item.title}>
            <div className="journey-milestone__dot" />
            <div className="journey-milestone__card glass">
              <div className="journey-milestone__top">
                <span className="journey-milestone__tag">{item.tag}</span>
                <span className="journey-milestone__year">{item.year}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


const ExperienceHighlights = () => (
  <section className="stats-section">
    <SectionHeading eyebrow="// experience-highlights" title="Experience Highlights" align="center" />
    <div className="stats-grid">
      {STATS.map((stat) => (
        <Counter stat={stat} key={stat.label} />
      ))}
    </div>
  </section>
);


const Strengths = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".strength-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="strengths" ref={ref}>
      <SectionHeading eyebrow="// my-strengths" title="My Strengths" align="center" />
      <div className="strengths-grid">
        {STRENGTHS.map((item, i) => (
          <StrengthCard item={item} index={i} key={item.title} />
        ))}
      </div>
    </section>
  );
};


const DailyWorkflow = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".flow-step",
        { y: 30, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );
      gsap.fromTo(
        ".flow-arrow",
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: ref.current, start: "top 78%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="workflow" ref={ref}>
      <SectionHeading eyebrow="// daily-workflow" title="Daily Workflow" align="center" />
      <div className="flow-chain">
        {WORKFLOW_STEPS.map((step, i) => (
          <React.Fragment key={step.step}>
            <div className="flow-step">
              <span className="flow-step__num">{step.step}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
            {i < WORKFLOW_STEPS.length - 1 && <span className="flow-arrow">&rarr;</span>}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};


const Philosophy = () => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".philosophy-word",
        { opacity: 0, y: 20, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.03,
          ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 70%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const quote = "Good code is not just written. It is crafted, tested, and cared for like a product someone will actually depend on.";

  return (
    <section className="philosophy" ref={ref}>
      <div className="philosophy-glow" />
      <Eyebrow>// philosophy</Eyebrow>
      <p className="philosophy-quote">
        {quote.split(" ").map((word, i) => (
          <span className="philosophy-word" key={i}>{word}&nbsp;</span>
        ))}
      </p>
    </section>
  );
};


const FunFacts = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fact-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 80%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="fun-facts" ref={ref}>
      <SectionHeading eyebrow="// fun-facts" title="Fun Facts" subtitle="Hover a card to flip it." align="center" />
      <div className="facts-grid">
        {FUN_FACTS.map((item) => (
          <FunFactCard item={item} key={item.title} />
        ))}
      </div>
    </section>
  );
};


const CurrentFocus = ({ tags }) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".focus-chip",
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: "back.out(1.6)", scrollTrigger: { trigger: ref.current, start: "top 82%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const focusTags = Array.isArray(tags) && tags.length > 0 ? tags : CURRENT_FOCUS;

  return (
    <section className="current-focus" ref={ref}>
      <SectionHeading eyebrow="// current-focus" title="Current Focus" subtitle="What's actively in rotation right now." align="center" />
      <div className="focus-grid">
        {focusTags.map((tech) => (
          <span className="focus-chip" key={tech}>{tech}</span>
        ))}
      </div>
    </section>
  );
};


const CTASection = ({ email }) => {
  const ref = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Name, email, and message are required.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      await publicApi.contact(form);
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Something went wrong. Please try again or email me directly.");
    }
  };

  return (
    <section className="cta-section" id="contact" ref={ref}>
      <div className="cta-glow" />
      <span className="cta-reveal p-eyebrow">// lets-talk</span>
      <h2 className="cta-reveal cta-title">
        Let&rsquo;s Create Something
        <br /> Extraordinary Together
      </h2>
      <p className="cta-reveal cta-sub">
        Open to full-time roles, freelance work, and anything worth building well.
      </p>
      <div className="cta-reveal cta-buttons">
        <a href={`mailto:${email}`} className="hero-cta hero-cta--primary">Email Me</a>
        <a href="#work" className="hero-cta hero-cta--ghost">See My Work</a>
      </div>

      <form className="cta-reveal contact-form" onSubmit={handleSubmit}>
        <div className="contact-form__row">
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="contact-form__row">
          <input
            type="tel"
            name="phone"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
          />
        </div>
        <textarea
          name="message"
          placeholder="Tell me about your project..."
          rows={5}
          value={form.message}
          onChange={handleChange}
          required
        />
        <button type="submit" className="hero-cta hero-cta--primary" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Send Message"}
        </button>
        {status === "success" && (
          <p className="contact-form__status contact-form__status--success">
            Thanks — your message has been sent. I&rsquo;ll get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p className="contact-form__status contact-form__status--error">{errorMsg}</p>
        )}
      </form>
    </section>
  );
};


const Profile = () => {
  useSeo("contact", {
    title: "Contact — Vishal Mall",
    description: "Get in touch with Vishal Mall for full-time roles, freelance work, or collaboration.",
  });

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const { data: settings } = usePublicData(() => publicApi.settings(), []);

  // Overlay whatever Settings actually has onto the fallback list — fields
  // Settings doesn't track (education, availability, freelance) simply keep
  // their fallback text.
  const overlay = {
    Name: settings?.name,
    Role: settings?.role,
    Location: settings?.address,
    Phone: settings?.phone,
    Experience: settings?.experience,
    Languages: settings?.languages,
    Email: settings?.email,
  };
  const personalInfo = FALLBACK_PERSONAL_INFO.map((item) =>
    overlay[item.label] ? { ...item, value: overlay[item.label] } : item
  );
  const email = settings?.email || "vishal.mall02@outlook.com";

  return (
    <>
    <main className="profile-page">
      <Navbar />
      <Hero />
      <AboutMe settings={settings} />
      <PersonalInfo info={personalInfo} />
      <CareerJourney />
      <ExperienceHighlights />
      <Strengths />
      <DailyWorkflow />
      <Philosophy />
      <FunFacts />
      <CurrentFocus tags={settings?.currentFocus} />
      <CTASection email={email} />
    </main>
    <Footer />
    </>
  );
};

export default Profile;
