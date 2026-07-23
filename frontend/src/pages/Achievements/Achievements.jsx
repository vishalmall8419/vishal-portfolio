import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import GlassCard from "../../components/ui/GlassCard";
import SectionTitle from "../../components/ui/SectionTitle";
import usePublicData from "../../hooks/usePublicData";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import "./Achievements.css";

const PAGE_SIZE = 9;

function AllAchievements() {
  useSeo("achievements", {
    title: "Achievements — Vishal Mall",
    description: "Awards, milestones and recognitions from Vishal Mall's development journey.",
  });

  const { data, loading } = usePublicData(() => publicApi.achievements(), []);
  const achievements = Array.isArray(data) ? data : [];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set(achievements.map((a) => a.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [achievements]);

  const filtered = useMemo(() => {
    return achievements.filter((a) => {
      const matchesCategory = category === "all" || a.category === category;
      const haystack = `${a.title || ""} ${a.briefDescription || ""} ${a.description || ""}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [achievements, category, query]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    const clamped = Math.min(Math.max(n, 1), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <main className="ach-page">
        <Navbar />

        <section className="ach-hero">
          <div className="ach-container">
            <SectionTitle
              subtitle="ACHIEVEMENTS"
              title="All"
              highlight=" Achievements"
              description="Every award, milestone and recognition from the journey so far."
              align="center"
            />
          </div>
        </section>

        <section className="ach-toolbar">
          <div className="ach-container ach-toolbar-inner">
            <input
              type="text"
              className="ach-search"
              placeholder="Search achievements…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />

            <div className="ach-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`ach-filter-chip ${category === cat ? "is-active" : ""}`}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ach-grid-section">
          <div className="ach-container">
            {loading ? (
              <div className="ach-state">Loading achievements…</div>
            ) : pageItems.length === 0 ? (
              <div className="ach-state">No achievements match your search.</div>
            ) : (
              <div className="ach-grid">
                {pageItems.map((item) => (
                  <GlassCard key={item.id} className="ach-card">
                    {item.image && (
                      <img
                        src={resolveAssetUrl(item.image)}
                        alt={item.title}
                        className="ach-card-image"
                        loading="lazy"
                      />
                    )}
                    <div className="ach-card-body">
                      {item.category && <span className="ach-card-tag">{item.category}</span>}
                      <h3>{item.title}</h3>
                      {item.date && (
                        <span className="ach-card-date">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <p>{item.briefDescription || item.description}</p>
                      {item.slug && (
                        <Link to={`/achievements/${item.slug}`} className="ach-card-link">
                          View Details →
                        </Link>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="ach-pagination">
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

export default AllAchievements;
