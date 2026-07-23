import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useSeo from "../../hooks/useSeo";
import useTheme from "../../hooks/useTheme";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import { Process, FAQ } from "../Services/Services";
import "./ServiceDetail.css";

// The Service model has no slug/detail-endpoint (list-only by design), so
// this reuses the existing /public/services list and finds the match by id
// client-side rather than adding a new backend route.
function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { siteSettings } = useTheme();
  const [services, setServices] = useState(null);
  const [status, setStatus] = useState("loading");

  const service = services?.find((s) => String(s.id) === String(id)) || null;

  useSeo(`service-${id}`, {
    title: service ? `${service.title} — Vishal Mall` : "Service — Vishal Mall",
    description: service?.description,
    image: service?.image,
  });

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    publicApi
      .services()
      .then(({ data }) => {
        if (cancelled) return;
        setServices(Array.isArray(data?.data) ? data.data : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const email = siteSettings?.email || "vishal.mall02@outlook.com";

  if (status === "loading") {
    return (
      <>
        <main className="svd-page">
          <Navbar />
          <div className="svd-state">Loading service...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "error" || !service) {
    return (
      <>
        <main className="svd-page">
          <Navbar />
          <div className="svd-state">
            <h2>Service not found</h2>
            <p>This service doesn&rsquo;t exist or is no longer offered.</p>
            <Link to="/services" className="svd-back"><FiArrowLeft /> Back to Services</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const relatedServices = services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <>
      <main className="svd-page">
        <Navbar />

        <article className="svd-article">
          <Link to="/services" className="svd-back"><FiArrowLeft /> Back to Services</Link>

          <header className="svd-hero">
            {service.image && (
              <div className="svd-icon">
                <img src={resolveAssetUrl(service.image)} alt={service.title} />
              </div>
            )}
            <h1 className="svd-title">{service.title}</h1>
            {service.price && <span className="svd-price">{service.price}</span>}
          </header>

          <section className="svd-section">
            <h2>Overview</h2>
            {String(service.description || "")
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((para, i) => <p key={i}>{para}</p>)}
          </section>

          {Array.isArray(service.features) && service.features.length > 0 && (
            <section className="svd-section">
              <h2>What&rsquo;s Included</h2>
              <ul className="svd-features">
                {service.features.map((f) => (
                  <li key={f}><FiCheck /> {f}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="svd-cta">
            <h2>Ready to get started?</h2>
            <p>Reach out and let&rsquo;s talk through your project.</p>
            <div className="svd-cta-buttons">
              <button className="svd-btn svd-btn--primary" onClick={() => navigate("/hire-me")}>Hire Me</button>
              <a href={`mailto:${email}`} className="svd-btn svd-btn--ghost">Email Me</a>
            </div>
          </section>
        </article>

        <Process />
        <FAQ />

        {relatedServices.length > 0 && (
          <section className="svd-related">
            <h2>Related Services</h2>
            <div className="svd-related-grid">
              {relatedServices.map((s) => (
                <Link key={s.id} to={`/services/${s.id}`} className="svd-related-card">
                  <span>{s.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export default ServiceDetail;
