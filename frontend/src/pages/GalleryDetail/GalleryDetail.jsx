import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiTag,
  FiLink,
  FiTwitter,
  FiLinkedin,
  FiFacebook,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import GlassCard from "../../components/ui/GlassCard";
import Lightbox from "../../components/Lightbox/Lightbox";
import useSeo from "../../hooks/useSeo";
import { publicApi, normalizeUrl } from "../../lib/publicApi";
import "./GalleryDetail.css";

function GalleryDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [copyLabel, setCopyLabel] = useState("Copy Link");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setActiveImage(0);
    publicApi
      .galleryBySlug(slug)
      .then(({ data }) => {
        if (cancelled) return;
        setItem(data?.data || null);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (status !== "ready") return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gald-reveal",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [status]);

  useSeo(`gallery-${slug}`, {
    title: item ? `${item.title} — Gallery — Vishal Mall` : "Gallery — Vishal Mall",
    description: item?.shortDescription || item?.description,
    image: item?.image,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = item?.title || "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Link"), 2000);
    } catch {
      // Clipboard API unavailable — the visible URL bar is the fallback.
    }
  };

  if (status === "loading") {
    return (
      <>
        <main className="gald-page">
          <Navbar />
          <div className="gald-state">Loading gallery item…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "error" || !item) {
    return (
      <>
        <main className="gald-page">
          <Navbar />
          <div className="gald-state">
            <p>Gallery item not found.</p>
            <Link to="/gallery" className="gald-back-link">
              <FiArrowLeft /> Back to gallery
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const carouselImages = [
    { url: item.image, alt: item.altText || item.title },
    ...(Array.isArray(item.galleryImages) ? item.galleryImages.map((g) => ({ url: g.url, alt: item.altText || item.title })) : []),
  ].filter((img) => img.url);

  return (
    <>
      <main className="gald-page">
        <Navbar />

        <section className="gald-hero">
          <div className="gald-container">
            <Link to="/gallery" className="gald-back-link gald-reveal">
              <FiArrowLeft /> Back to gallery
            </Link>

            <div className="gald-meta-row gald-reveal">
              <span className="gald-tag">
                <FiTag /> {item.category}
              </span>
            </div>

            <h1 className="gald-title gald-reveal">{item.title}</h1>

            {item.shortDescription && <p className="gald-brief gald-reveal">{item.shortDescription}</p>}
          </div>
        </section>

        <section className="gald-container gald-carousel gald-reveal">
          <button className="gald-main-image-btn" onClick={() => setLightboxIndex(activeImage)}>
            <img src={carouselImages[activeImage]?.url} alt={carouselImages[activeImage]?.alt} className="gald-main-image" />
          </button>

          {carouselImages.length > 1 && (
            <div className="gald-thumbs">
              {carouselImages.map((img, i) => (
                <button
                  key={img.url + i}
                  className={`gald-thumb ${i === activeImage ? "is-active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="gald-container gald-body gald-reveal">
          <div className="gald-body-main">
            {item.description && (
              <div className="gald-description">
                {item.description.split("\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}

            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div className="gald-tags-block">
                <h3>Technologies Used</h3>
                <div className="gald-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="gald-tag-chip">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="gald-links-row">
              {item.projectLink && (
                <a href={normalizeUrl(item.projectLink)} target="_blank" rel="noopener noreferrer" className="gald-link-btn">
                  <FiExternalLink /> Live Project
                </a>
              )}
              {item.githubLink && (
                <a href={normalizeUrl(item.githubLink)} target="_blank" rel="noopener noreferrer" className="gald-link-btn gald-link-btn-outline">
                  <FiGithub /> View Code
                </a>
              )}
            </div>
          </div>

          <aside className="gald-share-panel">
            <h3>Share this</h3>
            <div className="gald-share-buttons">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter"
              >
                <FiTwitter />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <FiLinkedin />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
              >
                <FiFacebook />
              </a>
              <button onClick={handleCopyLink} aria-label="Copy link">
                <FiLink /> <span className="gald-copy-label">{copyLabel}</span>
              </button>
            </div>
          </aside>
        </section>

        {Array.isArray(item.related) && item.related.length > 0 && (
          <section className="gald-container gald-related gald-reveal">
            <h2>Related Gallery Items</h2>
            <div className="gald-related-grid">
              {item.related.map((rel) => (
                <Link to={`/gallery/${rel.slug}`} key={rel.id} className="gald-related-card-link">
                  <GlassCard className="gald-related-card">
                    {rel.image && <img src={rel.image} alt={rel.title} loading="lazy" />}
                    <div>
                      <h4>{rel.title}</h4>
                      <span>{rel.category}</span>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Footer />
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          images={carouselImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={(i) => { setLightboxIndex(i); setActiveImage(i); }}
        />
      )}
    </>
  );
}

export default GalleryDetail;
