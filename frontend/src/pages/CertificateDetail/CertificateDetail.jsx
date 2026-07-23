import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiExternalLink, FiCalendar, FiTag, FiAward } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl, normalizeUrl } from "../../lib/publicApi";
import "./CertificateDetail.css";

function CertificateDetail() {
  const { slug } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    publicApi
      .certificateBySlug(slug)
      .then(({ data }) => {
        if (cancelled) return;
        setCertificate(data?.data || null);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useSeo(`certificate-${slug}`, {
    title: certificate ? `${certificate.title} — Vishal Mall` : "Certificate — Vishal Mall",
    description: certificate?.description || `${certificate?.title || ""} issued by ${certificate?.issuer || ""}`,
    image: certificate?.image,
  });

  if (status === "loading") {
    return (
      <>
        <main className="certd-page">
          <Navbar />
          <div className="certd-state">Loading certificate…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "error" || !certificate) {
    return (
      <>
        <main className="certd-page">
          <Navbar />
          <div className="certd-state">
            <p>Certificate not found.</p>
            <Link to="/certificates" className="certd-back-link">
              <FiArrowLeft /> Back to all certificates
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="certd-page">
        <Navbar />

        <section className="certd-hero">
          <div className="certd-container">
            <Link to="/certificates" className="certd-back-link">
              <FiArrowLeft /> Back to all certificates
            </Link>

            <div className="certd-meta-row">
              {certificate.category && (
                <span className="certd-tag">
                  <FiTag /> {certificate.category}
                </span>
              )}
              <span className="certd-tag">
                <FiAward /> {certificate.issuer}
              </span>
              {certificate.issueDate && (
                <span className="certd-tag">
                  <FiCalendar />{" "}
                  {new Date(certificate.issueDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="certd-title">{certificate.title}</h1>

            {certificate.credentialUrl && (
              <a
                href={normalizeUrl(certificate.credentialUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="certd-verify-btn"
              >
                <FiExternalLink /> Verify Credential
              </a>
            )}
          </div>
        </section>

        {certificate.image && (
          <section className="certd-container certd-image-wrap">
            <img
              src={resolveAssetUrl(certificate.image)}
              alt={certificate.title}
              className="certd-image"
            />
          </section>
        )}

        {certificate.description && (
          <section className="certd-container certd-body">
            {certificate.description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}

export default CertificateDetail;
