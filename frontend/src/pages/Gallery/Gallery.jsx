import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiSearch } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import SectionTitle from "../../components/ui/SectionTitle";
import Lightbox from "../../components/Lightbox/Lightbox";
import usePublicData from "../../hooks/usePublicData";
import useSeo from "../../hooks/useSeo";
import { publicApi } from "../../lib/publicApi";
import "./Gallery.css";

gsap.registerPlugin(ScrollTrigger);

const PAGE_SIZE = 12;

function GallerySkeleton() {
  return (
    <div className="gal-grid">
      {Array.from({ length: 9 }).map((_, i) => (
        <div className={`gal-skeleton-card gal-skeleton-h${(i % 3) + 1}`} key={i} />
      ))}
    </div>
  );
}

function GalleryPage() {
  useSeo("gallery", {
    title: "Gallery — Vishal Mall",
    description: "A visual gallery of projects, UI designs, dashboards and more from Vishal Mall's work.",
  });

  const { data: categoriesData } = usePublicData(() => publicApi.galleryCategories(), []);
  const categories = ["all", ...(Array.isArray(categoriesData) ? categoriesData : [])];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const gridRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    publicApi
      .gallery({
        page,
        limit: PAGE_SIZE,
        q: query || undefined,
        category: category === "all" ? undefined : category,
      })
      .then(({ data }) => {
        if (cancelled) return;
        setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(() => {
        if (!cancelled) setItems((prev) => (page === 1 ? [] : prev));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, query, category]);

  // Reset to page 1 whenever the search/filter changes.
  useEffect(() => {
    setPage(1);
  }, [query, category]);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gal-card",
        { y: 30, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: "power3.out" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [items, loading]);

  const lightboxImages = useMemo(
    () => items.map((item) => ({ url: item.image, alt: item.altText || item.title })),
    [items]
  );

  return (
    <>
      <main className="gal-page">
        <Navbar />

        <section className="gal-hero">
          <div className="gal-container">
            <SectionTitle
              subtitle="GALLERY"
              title="Visual"
              highlight=" Gallery"
              description="A curated look at projects, UI designs, dashboards and more."
              align="center"
            />
          </div>
        </section>

        <section className="gal-toolbar">
          <div className="gal-container gal-toolbar-inner">
            <div className="gal-search-wrap">
              <FiSearch />
              <input
                type="text"
                placeholder="Search the gallery…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="gal-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`gal-filter-chip ${category === cat ? "is-active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="gal-grid-section" ref={gridRef}>
          <div className="gal-container">
            {loading && page === 1 ? (
              <GallerySkeleton />
            ) : items.length === 0 ? (
              <div className="gal-empty-state">No gallery items match your search.</div>
            ) : (
              <div className="gal-grid">
                {items.map((item, i) => (
                  <div className="gal-card" key={item.id}>
                    <button className="gal-card-image-btn" onClick={() => setLightboxIndex(i)}>
                      <img
                        src={item.image}
                        alt={item.altText || item.title}
                        loading="lazy"
                        className="gal-card-image"
                      />
                      <span className="gal-card-overlay">
                        <span className="gal-card-overlay-title">{item.title}</span>
                        <span className="gal-card-overlay-cat">{item.category}</span>
                      </span>
                    </button>
                    <Link to={`/gallery/${item.slug}`} className="gal-card-link">
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {!loading && page < totalPages && (
              <div className="gal-load-more-wrap">
                <button className="gal-load-more" onClick={() => setPage((p) => p + 1)}>
                  Load More
                </button>
              </div>
            )}

            {loading && page > 1 && <div className="gal-loading-more">Loading more…</div>}
          </div>
        </section>

        <Footer />
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}

export default GalleryPage;
