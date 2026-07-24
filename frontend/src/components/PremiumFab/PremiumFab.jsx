import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiPlus, FiX, FiArrowUp, FiSun, FiMoon, FiMessageCircle } from "react-icons/fi";
import { FaRobot } from "react-icons/fa";
import { gsap } from "../../lib/gsap";
import useTheme from "../../hooks/useTheme";
import "./PremiumFab.css";

// Single premium floating action button replacing the three independent
// floating buttons (AI Assistant, Theme Toggle, Go To Top). Expands into a
// stacked action menu on click; collapses on outside click, on selecting an
// action, or on a large scroll jump so it never sits awkwardly open over
// content the user just scrolled to.
function PremiumFab() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const actionsRef = useRef(null);
  const itemRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isAiPage = location.pathname === "/ai";

  // Close on outside click.
  useEffect(() => {
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on a large scroll jump while open, and on Escape.
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      if (open && Math.abs(window.scrollY - lastY) > 80) {
        setOpen(false);
      }
      lastY = window.scrollY;
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // GSAP stagger reveal / collapse.
  useEffect(() => {
    if (!actionsRef.current) return undefined;

    const ctx = gsap.context(() => {
      const itemEls = itemRefs.current.filter(Boolean);

      if (open) {
        gsap.fromTo(
          itemEls,
          { autoAlpha: 0, y: 22, scale: 0.6 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.07, ease: "back.out(1.8)" }
        );
      } else {
        gsap.to(itemEls, {
          autoAlpha: 0,
          y: 14,
          scale: 0.7,
          duration: 0.2,
          stagger: 0.03,
          ease: "power2.in",
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [open]);

  const handleAi = () => {
    setOpen(false);
    navigate("/ai");
  };

  const handleChatbot = () => {
    setOpen(false);
    navigate("/ai", { state: { focusChat: true } });
  };

  const handleTheme = () => {
    toggleTheme();
    setOpen(false);
  };

  const handleTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setOpen(false);
  };

  return (
    <div className={`vm-fab-root ${open ? "is-open" : ""}`} ref={rootRef}>
      <div className="vm-fab-actions" ref={actionsRef}>
        <div className="vm-fab-item" ref={(el) => (itemRefs.current[0] = el)}>
          <span className="vm-fab-label">Go To Top</span>
          <button type="button" className="vm-fab-action" onClick={handleTop} aria-label="Scroll to top">
            <FiArrowUp />
          </button>
        </div>

        <div className="vm-fab-item" ref={(el) => (itemRefs.current[1] = el)}>
          <span className="vm-fab-label">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          <button type="button" className="vm-fab-action" onClick={handleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        {!isAiPage && (
          <div className="vm-fab-item" ref={(el) => (itemRefs.current[2] = el)}>
            <span className="vm-fab-label">VP-ChatBot</span>
            <button
              type="button"
              className="vm-fab-action vm-fab-action-ai"
              onClick={handleAi}
              aria-label="Open VP-ChatBot"
            >
              <FiMessageCircle />
            </button>
          </div>
        )}

        <div className="vm-fab-item" ref={(el) => (itemRefs.current[3] = el)}>
          <span className="vm-fab-label">Chatbot</span>
          <button
            type="button"
            className="vm-fab-action vm-fab-action-chatbot"
            onClick={handleChatbot}
            aria-label="Open chatbot"
          >
            <FaRobot />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="vm-fab-main"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close quick actions" : "Open quick actions"}
        aria-expanded={open}
      >
        <span className="vm-fab-main-icon">{open ? <FiX /> : <FiPlus />}</span>
      </button>
    </div>
  );
}

export default PremiumFab;
