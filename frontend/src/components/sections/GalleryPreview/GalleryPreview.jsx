import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./GalleryPreview.css";
import SectionTitle from "../../ui/SectionTitle";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi } from "../../../lib/publicApi";

gsap.registerPlugin(ScrollTrigger);

function GalleryPreview() {
  const ref = useRef(null);
  const { data, loading } = usePublicData(
    () => publicApi.gallery({ featured: true, limit: 8 }),
    []
  );
  const items = Array.isArray(data) ? data : [];

  useLayoutEffect(() => {
    if (loading || !items.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gp-card",
        { y: 30, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 78%" },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [loading, items.length]);

  // No featured gallery items yet — skip the section entirely rather than
  // showing an empty/fake block on the Home page.
  if (!loading && items.length === 0) return null;

  return (
    <section className="gp-section" ref={ref}>
      <div className="gp-container">
        <SectionTitle
          subtitle="GALLERY"
          title="Visual"
          highlight=" Showcase"
          description="A glimpse into projects, UI designs and more."
          align="center"
        />

        <div className="gp-grid">
          {items.map((item) => (
            <Link to={`/gallery/${item.slug}`} className="gp-card" key={item.id}>
              <img src={item.image} alt={item.altText || item.title} loading="lazy" />
              <span className="gp-card-overlay">
                <span className="gp-card-title">{item.title}</span>
                <span className="gp-card-cat">{item.category}</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="gp-cta">
          <Link to="/gallery" className="gp-cta-btn">
            View Complete Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}

export default GalleryPreview;
