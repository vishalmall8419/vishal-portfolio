import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import GlassCard from "../../components/ui/GlassCard";
import SectionTitle from "../../components/ui/SectionTitle";
import usePublicData from "../../hooks/usePublicData";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import { FiStar } from "react-icons/fi";
import "./Testimonials.css";

const PAGE_SIZE = 9;

function AllTestimonials() {
  useSeo("testimonials", {
    title: "Testimonials — Vishal Mall",
    description: "Feedback and appreciation from people Vishal Mall has collaborated and learned with.",
  });

  const { data, loading } = usePublicData(() => publicApi.testimonials(), []);
  const testimonials = Array.isArray(data) ? data : [];

  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return testimonials.filter((t) => {
      const matchesRating = minRating === 0 || (t.rating || 0) >= minRating;
      const haystack = `${t.name || ""} ${t.designation || ""} ${t.review || ""}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesRating && matchesQuery;
    });
  }, [testimonials, minRating, query]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    const clamped = Math.min(Math.max(n, 1), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <main className="test-page">
        <Navbar />

        <section className="test-hero">
          <div className="test-container">
            <SectionTitle
              subtitle="TESTIMONIALS"
              title="What People"
              highlight=" Say"
              description="Every review shared by people I've collaborated and learned with."
              align="center"
            />
          </div>
        </section>

        <section className="test-toolbar">
          <div className="test-container test-toolbar-inner">
            <input
              type="text"
              className="test-search"
              placeholder="Search testimonials…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />

            <div className="test-filters">
              {[0, 5, 4, 3].map((r) => (
                <button
                  key={r}
                  className={`test-filter-chip ${minRating === r ? "is-active" : ""}`}
                  onClick={() => {
                    setMinRating(r);
                    setPage(1);
                  }}
                >
                  {r === 0 ? "All Ratings" : `${r}★ & up`}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="test-grid-section">
          <div className="test-container">
            {loading ? (
              <div className="test-state">Loading testimonials…</div>
            ) : pageItems.length === 0 ? (
              <div className="test-state">No testimonials match your search.</div>
            ) : (
              <div className="test-grid">
                {pageItems.map((item) => {
                  const isExpanded = expandedId === item.id;
                  const isLong = (item.review || "").length > 180;
                  const displayText =
                    isLong && !isExpanded ? `${item.review.slice(0, 180)}…` : item.review;

                  return (
                    <GlassCard key={item.id} className="test-card">
                      <div className="test-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar
                            key={i}
                            className={i < (item.rating || 0) ? "test-star-filled" : "test-star-empty"}
                          />
                        ))}
                      </div>

                      <p>"{displayText}"</p>

                      {isLong && (
                        <button
                          className="test-read-more"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}

                      <div className="test-person">
                        <div className="test-avatar">
                          {item.photo ? (
                            <img src={resolveAssetUrl(item.photo)} alt={item.name} />
                          ) : (
                            item.name?.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4>{item.name}</h4>
                          <span>{item.designation}</span>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="test-pagination">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
                  Next
                </button>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

export default AllTestimonials;
