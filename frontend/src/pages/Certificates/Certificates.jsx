import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import GlassCard from "../../components/ui/GlassCard";
import SectionTitle from "../../components/ui/SectionTitle";
import usePublicData from "../../hooks/usePublicData";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import "./Certificates.css";

const PAGE_SIZE = 9;

function AllCertificates() {
  useSeo("certificates", {
    title: "Certificates — Vishal Mall",
    description: "Certifications and credentials earned by Vishal Mall.",
  });

  const { data, loading } = usePublicData(() => publicApi.certificates(), []);
  const certificates = Array.isArray(data) ? data : [];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const set = new Set(certificates.map((c) => c.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [certificates]);

  const filtered = useMemo(() => {
    return certificates.filter((c) => {
      const matchesCategory = category === "all" || c.category === category;
      const haystack = `${c.title || ""} ${c.issuer || ""} ${c.description || ""}`.toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [certificates, category, query]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    const clamped = Math.min(Math.max(n, 1), totalPages);
    setPage(clamped);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <main className="cert-page">
        <Navbar />

        <section className="cert-hero">
          <div className="cert-container">
            <SectionTitle
              subtitle="CERTIFICATES"
              title="All"
              highlight=" Certificates"
              description="Every certification and credential earned along the way."
              align="center"
            />
          </div>
        </section>

        <section className="cert-toolbar">
          <div className="cert-container cert-toolbar-inner">
            <input
              type="text"
              className="cert-search"
              placeholder="Search certificates…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />

            <div className="cert-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`cert-filter-chip ${category === cat ? "is-active" : ""}`}
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

        <section className="cert-grid-section">
          <div className="cert-container">
            {loading ? (
              <div className="cert-state">Loading certificates…</div>
            ) : pageItems.length === 0 ? (
              <div className="cert-state">No certificates match your search.</div>
            ) : (
              <div className="cert-grid">
                {pageItems.map((item) => (
                  <GlassCard key={item.id} className="cert-card">
                    {item.image && (
                      <img
                        src={resolveAssetUrl(item.image)}
                        alt={item.title}
                        className="cert-card-image"
                        loading="lazy"
                      />
                    )}
                    <div className="cert-card-body">
                      {item.category && <span className="cert-card-tag">{item.category}</span>}
                      <h3>{item.title}</h3>
                      <span className="cert-card-issuer">{item.issuer}</span>
                      {item.issueDate && (
                        <span className="cert-card-date">
                          {new Date(item.issueDate).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                      {item.slug && (
                        <Link to={`/certificates/${item.slug}`} className="cert-card-link">
                          View Details →
                        </Link>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="cert-pagination">
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

export default AllCertificates;
