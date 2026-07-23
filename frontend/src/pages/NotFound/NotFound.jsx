import { Link, useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useTheme from "../../hooks/useTheme";
import { resolveAssetUrl } from "../../lib/publicApi";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();
  const { siteSettings } = useTheme();
  const logoUrl = resolveAssetUrl(siteSettings?.logo);
  const siteName = siteSettings?.name || "Vishal Mall";

  return (
    <>
      <main className="notfound-page">
        <Navbar />

        <section className="notfound-content">
          {logoUrl && <img src={logoUrl} alt={siteName} className="notfound-logo" />}

          <h1 className="notfound-code">404</h1>
          <h2 className="notfound-title">Page Not Found</h2>
          <p className="notfound-desc">
            The page you&rsquo;re looking for doesn&rsquo;t exist, may have been moved,
            or the URL was mistyped. Let&rsquo;s get you back on track.
          </p>

          <div className="notfound-actions">
            <Link to="/" className="notfound-btn notfound-btn--primary">
              <FiHome /> Go Home
            </Link>
            <button type="button" className="notfound-btn notfound-btn--ghost" onClick={() => navigate(-1)}>
              <FiArrowLeft /> Go Back
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default NotFound;
