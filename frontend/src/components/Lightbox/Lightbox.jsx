import { useEffect, useRef, useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from "react-icons/fi";
import "./Lightbox.css";

/**
 * Premium image lightbox: prev/next, close, keyboard nav, swipe on mobile,
 * click-to-zoom, and an "X / N" counter. Framework-free (no external
 * lightbox library — this sandbox can't npm install anything new).
 *
 * images: [{ url, alt }]
 */
function Lightbox({ images, index, onClose, onIndexChange }) {
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(null);

  const total = images.length;
  const current = images[index];

  const goTo = (next) => {
    setZoomed(false);
    onIndexChange(((next % total) + total) % total);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      goTo(delta > 0 ? index - 1 : index + 1);
    }
    touchStartX.current = null;
  };

  if (!current) return null;

  return (
    <div className="vm-lightbox" onClick={onClose}>
      <button className="vm-lightbox-close" onClick={onClose} aria-label="Close">
        <FiX />
      </button>

      <span className="vm-lightbox-counter">
        {index + 1} / {total}
      </span>

      {total > 1 && (
        <button
          className="vm-lightbox-nav vm-lightbox-prev"
          onClick={(e) => { e.stopPropagation(); goTo(index - 1); }}
          aria-label="Previous image"
        >
          <FiChevronLeft />
        </button>
      )}

      <div
        className="vm-lightbox-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={current.url}
          alt={current.alt || ""}
          className={`vm-lightbox-image ${zoomed ? "is-zoomed" : ""}`}
          onClick={() => setZoomed((z) => !z)}
        />
      </div>

      {total > 1 && (
        <button
          className="vm-lightbox-nav vm-lightbox-next"
          onClick={(e) => { e.stopPropagation(); goTo(index + 1); }}
          aria-label="Next image"
        >
          <FiChevronRight />
        </button>
      )}

      <button
        className="vm-lightbox-zoom"
        onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
        aria-label="Toggle zoom"
      >
        {zoomed ? <FiZoomOut /> : <FiZoomIn />}
      </button>
    </div>
  );
}

export default Lightbox;
