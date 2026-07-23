import { Link } from "react-router-dom";
import "./Certificates.css";
import GlassCard from "../../ui/GlassCard";
import SectionTitle from "../../ui/SectionTitle";
import Button from "../../ui/Button";
import usePublicData from "../../../hooks/usePublicData";
import { publicApi, normalizeUrl } from "../../../lib/publicApi";

// Fallback only used if the Certificates CMS resource is empty/unreachable.
const FALLBACK_CERTIFICATES = [
  { id: 1, title: "Java Full Stack Development", issuer: "Professional Training", year: "2025" },
  { id: 2, title: "React Development", issuer: "Online Certification", year: "2025" },
  { id: 3, title: "Java Programming", issuer: "Programming Course", year: "2024" },
  { id: 4, title: "Web Development", issuer: "Frontend Certification", year: "2024" },
];

function Certificates() {
  const { data, loading } = usePublicData(() => publicApi.certificates(), []);
  const certificates =
    !loading && Array.isArray(data) && data.length
      ? data.slice(0, 6).map((row) => ({
          id: row.id,
          slug: row.slug,
          title: row.title,
          issuer: row.issuer,
          year: row.issueDate ? new Date(row.issueDate).getFullYear() : "",
          // Root-cause fix (same bug class as the social-link issue): a raw
          // admin-entered URL without a scheme rendered as a relative link.
          credentialUrl: normalizeUrl(row.credentialUrl),
        }))
      : FALLBACK_CERTIFICATES;

  return (
    <section className="vm-certificates">
      <div className="vm-certificates-container">

        <SectionTitle
          subtitle="CERTIFICATES"
          title="Professional"
          highlight=" Certifications"
          description="Certifications that reflect my continuous learning and technical growth."
          align="center"
        />

        <div className="vm-certificates-grid">

          {certificates.map((certificate) => (
            <GlassCard
              key={certificate.id}
              className="vm-certificate-card"
            >
              <div className="vm-certificate-year">
                {certificate.year}
              </div>

              <h3>{certificate.title}</h3>

              <p>{certificate.issuer}</p>

              <div className="vm-certificate-actions">
                {certificate.slug && (
                  <Link to={`/certificates/${certificate.slug}`} style={{ textDecoration: "none", display: "inline-block" }}>
                    <Button>View Details</Button>
                  </Link>
                )}

                {certificate.credentialUrl && (
                  <a
                    href={certificate.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vm-certificate-verify-link"
                  >
                    Verify →
                  </a>
                )}
              </div>
            </GlassCard>
          ))}

        </div>

        <div className="vm-certificates-cta">
          <Link to="/certificates" className="vm-certificates-view-all">
            View All Certificates
          </Link>
        </div>

      </div>
    </section>
  );
}

export default Certificates;
