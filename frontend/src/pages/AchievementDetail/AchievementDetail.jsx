import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiShare2, FiCalendar, FiTag } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer/Footer";
import useSeo from "../../hooks/useSeo";
import { publicApi, resolveAssetUrl } from "../../lib/publicApi";
import "./AchievementDetail.css";

function AchievementDetail() {
  const { slug } = useParams();
  const [achievement, setAchievement] = useState(null);
  const [status, setStatus] = useState("loading");
  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    publicApi
      .achievementBySlug(slug)
      .then(({ data }) => {
        if (cancelled) return;
        setAchievement(data?.data || null);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useSeo(`achievement-${slug}`, {
    title: achievement ? `${achievement.title} — Vishal Mall` : "Achievement — Vishal Mall",
    description: achievement?.briefDescription || achievement?.description,
    image: achievement?.image,
  });

  const handleShare = async () => {
    const shareData = {
      title: achievement?.title,
      text: achievement?.briefDescription || achievement?.description,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Link copied!");
        setTimeout(() => setShareLabel("Share"), 2000);
      }
    } catch {
      // user cancelled the native share sheet — nothing to do
    }
  };

  if (status === "loading") {
    return (
      <>
        <main className="achd-page">
          <Navbar />
          <div className="achd-state">Loading achievement…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (status === "error" || !achievement) {
    return (
      <>
        <main className="achd-page">
          <Navbar />
          <div className="achd-state">
            <p>Achievement not found.</p>
            <Link to="/achievements" className="achd-back-link">
              <FiArrowLeft /> Back to all achievements
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const gallery = Array.isArray(achievement.gallery) ? achievement.gallery : [];

  return (
    <>
      <main className="achd-page">
        <Navbar />

        <section className="achd-hero">
          <div className="achd-container">
            <Link to="/achievements" className="achd-back-link">
              <FiArrowLeft /> Back to all achievements
            </Link>

            <div className="achd-meta-row">
              {achievement.category && (
                <span className="achd-tag">
                  <FiTag /> {achievement.category}
                </span>
              )}
              {achievement.date && (
                <span className="achd-tag">
                  <FiCalendar />{" "}
                  {new Date(achievement.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="achd-title">{achievement.title}</h1>

            {achievement.briefDescription && (
              <p className="achd-brief">{achievement.briefDescription}</p>
            )}

            <button className="achd-share-btn" onClick={handleShare}>
              <FiShare2 /> {shareLabel}
            </button>
          </div>
        </section>

        {achievement.image && (
          <section className="achd-container achd-hero-image-wrap">
            <img
              src={resolveAssetUrl(achievement.image)}
              alt={achievement.title}
              className="achd-hero-image"
            />
          </section>
        )}

        <section className="achd-container achd-body">
          {achievement.description && (
            <div className="achd-description">
              {achievement.description.split("\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {gallery.length > 0 && (
            <div className="achd-gallery">
              {gallery.map((img, i) => (
                <img key={i} src={resolveAssetUrl(img)} alt={`${achievement.title} gallery ${i + 1}`} loading="lazy" />
              ))}
            </div>
          )}
        </section>

        <Footer />
      </main>
    </>
  );
}

export default AchievementDetail;
