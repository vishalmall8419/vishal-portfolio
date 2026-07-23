import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiCalendar, FiClock, FiUser, FiSearch, FiFileText } from "react-icons/fi";
import "./Blogs.css";
import Navbar from "../../components/Navbar";
import usePublicData from "../../hooks/usePublicData";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import Footer from "../../components/Footer/Footer";
import useTheme from "../../hooks/useTheme";
import useSeo from "../../hooks/useSeo";

gsap.registerPlugin(ScrollTrigger);

// The Blog model has no dedicated author field (single-author portfolio
// blog), so the byline falls back to the site owner's name from Settings.
const AUTHOR_NAME_FALLBACK = "Vishal Mall";

/*  FALLBACK CONTENT — shown only while the CMS has no posts yet       */
/*  or the API is unreachable, so the page never renders empty.        */

const FALLBACK_BLOGS = [
  {
    id: 1,
    slug: "building-enterprise-java-apps",
    category: "Java",
    title: "Building Enterprise Applications with Java",
    excerpt: "Learn how to create scalable Java applications using modern architecture and best practices.",
    coverImage: null,
    publishedAt: "2026-07-12",
    readTime: 8,
  },
  {
    id: 2,
    slug: "premium-ui-react-tailwind",
    category: "React",
    title: "Creating Premium UI with React & Tailwind CSS",
    excerpt: "A complete guide to building responsive and beautiful user interfaces.",
    coverImage: null,
    publishedAt: "2026-07-08",
    readTime: 6,
  },
  {
    id: 3,
    slug: "node-express-mysql-rest-api",
    category: "Full Stack",
    title: "Node.js, Express & MySQL REST API Guide",
    excerpt: "Build secure, scalable and production-ready REST APIs from scratch.",
    coverImage: null,
    publishedAt: "2026-07-01",
    readTime: 10,
  },
];

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};


const Eyebrow = ({ children }) => <span className="bg-eyebrow">{children}</span>;

const SectionHeading = ({ eyebrow, title, subtitle, align }) => (
  <div className={`bg-heading${align === "center" ? " bg-heading--center" : ""}`}>
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    <h2 className="bg-heading__title">{title}</h2>
    {subtitle && <p className="bg-heading__sub">{subtitle}</p>}
  </div>
);


const Hero = () => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".bg-hero-tag", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
        .fromTo(".bg-hero-title span", { y: "110%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.9, stagger: 0.08 }, "-=0.3")
        .fromTo(".bg-hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5");
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className="bg-hero" ref={ref}>
      <div className="bg-hero-glow" />
      <span className="bg-hero-tag bg-eyebrow">// the-blog</span>
      <h1 className="bg-hero-title">
        <span className="bg-line">Notes on building</span>
        <span className="bg-line bg-line--accent">real software.</span>
      </h1>
      <p className="bg-hero-sub">
        Tutorials, write-ups and lessons from shipping full-stack products —
        the parts tutorials usually skip.
      </p>
    </section>
  );
};


const FeaturedPost = ({ post }) => {
  const { siteSettings } = useTheme();
  const authorName = siteSettings?.name || AUTHOR_NAME_FALLBACK;
  if (!post) return null;
  return (
    <section className="bg-featured">
      <SectionHeading eyebrow="// featured" title="Latest Post" align="left" />
      <a href={`/blog/${post.slug || ""}`} className="bg-featured-card glass">
        <div className="bg-featured-image">
          {post.coverImage ? (
            <img src={resolveAssetUrl(post.coverImage)} alt={post.title} />
          ) : (
            <div className="bg-featured-image__placeholder">
              <FiFileText />
            </div>
          )}
        </div>
        <div className="bg-featured-body">
          {post.category && <span className="bg-tag">{post.category}</span>}
          <h3 className="bg-featured-title">{post.title}</h3>
          <p className="bg-featured-excerpt">{post.excerpt}</p>
          <div className="bg-meta">
            <span>
              <FiUser /> {authorName}
            </span>
            {post.publishedAt && (
              <span>
                <FiCalendar /> {formatDate(post.publishedAt)}
              </span>
            )}
            <span>
              <FiClock /> {post.readTime || 1} min read
            </span>
          </div>
          <span className="bg-featured-cta">
            Read Article <FiArrowRight />
          </span>
        </div>
      </a>
    </section>
  );
};


const BlogCard = ({ post }) => (
  <a href={`/blog/${post.slug || ""}`} className="bg-card glass blog-reveal">
    <div className="bg-card-image">
      {post.coverImage ? (
        <img src={resolveAssetUrl(post.coverImage)} alt={post.title} loading="lazy" />
      ) : (
        <div className="bg-card-image__placeholder">
          <FiFileText />
        </div>
      )}
      {post.category && <span className="bg-card-category">{post.category}</span>}
    </div>
    <div className="bg-card-body">
      <h3 className="bg-card-title">{post.title}</h3>
      <p className="bg-card-excerpt">{post.excerpt}</p>
      <div className="bg-meta bg-meta--sm">
        <span>
          <FiCalendar /> {formatDate(post.publishedAt) || "Draft"}
        </span>
        <span>
          <FiClock /> {post.readTime || 1} min
        </span>
      </div>
      <span className="bg-card-link">
        Read More <FiArrowRight />
      </span>
    </div>
  </a>
);

const BlogCardSkeleton = () => (
  <div className="bg-card bg-card--skeleton glass">
    <div className="bg-skel bg-skel--image" />
    <div className="bg-card-body">
      <div className="bg-skel bg-skel--title" />
      <div className="bg-skel bg-skel--line" />
      <div className="bg-skel bg-skel--line" style={{ width: "70%" }} />
    </div>
  </div>
);


const BlogGrid = ({ posts, loading }) => {
  const ref = useRef(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesQuery =
        !query.trim() ||
        p.title?.toLowerCase().includes(query.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [posts, activeCategory, query]);

  useLayoutEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".blog-reveal",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: ref.current, start: "top 82%" } }
      );
    }, ref);
    return () => ctx.revert();
  }, [loading, filtered.length]);

  return (
    <section className="bg-grid-section" ref={ref}>
      <SectionHeading eyebrow="// all-posts" title="All Articles" align="left" />

      <div className="bg-controls">
        <div className="bg-categories">
          {categories.map((c) => (
            <button
              key={c}
              className={`bg-category-pill${activeCategory === c ? " is-active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="bg-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="bg-grid">
          {filtered.map((post) => (
            <BlogCard post={post} key={post.id ?? post.slug} />
          ))}
        </div>
      ) : (
        <div className="bg-empty glass">
          <FiFileText className="bg-empty__icon" />
          <p>
            {posts.length
              ? "No articles match that search — try a different keyword or category."
              : "No blog posts published yet — check back soon."}
          </p>
        </div>
      )}
    </section>
  );
};


const CTASection = () => {
  const { siteSettings } = useTheme();
  const email = siteSettings?.email || "vishal.mall02@outlook.com";
  return (
    <section className="bg-cta">
      <div className="bg-cta-glow" />
      <span className="bg-eyebrow">// stay-updated</span>
      <h2 className="bg-cta-title">Have a topic you'd like covered?</h2>
      <p className="bg-cta-sub">Send a suggestion, or reach out about a project.</p>
      <a href={`mailto:${email}`} className="bg-btn bg-btn--primary">
        Get in Touch
      </a>
    </section>
  );
};


const Blogs = () => {
  useSeo("blogs", {
    title: "Blog — Vishal Mall",
    description: "Tutorials, write-ups and lessons from shipping full-stack products.",
  });

  useLayoutEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const { data, loading, error } = usePublicData(() => publicApi.blogs(), []);
  const hasPosts = !loading && Array.isArray(data) && data.length;
  const posts = hasPosts ? data : loading && !error ? [] : FALLBACK_BLOGS;

  const [featured, ...rest] = posts;

  return (
    <>
    <main className="blogs-page">
      <Navbar />
      <Hero />
      {!loading && featured && <FeaturedPost post={featured} />}
      <BlogGrid posts={!loading && featured ? rest : posts} loading={loading} />
      <CTASection />
    </main>
    <Footer />
    </>
  );
};

export default Blogs;
