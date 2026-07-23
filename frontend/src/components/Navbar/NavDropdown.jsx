import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiChevronDown } from "react-icons/hi";
import { gsap } from "../../lib/gsap";
import "./NavDropdown.css";

function NavDropdown({ title, items, onNavigate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const arrowRef = useRef(null);
  const itemRefs = useRef([]);

  // Close on outside click.
  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // GSAP open/close + stagger + arrow rotation.
  useEffect(() => {
    if (!panelRef.current) return undefined;

    const ctx = gsap.context(() => {
      const itemEls = itemRefs.current.filter(Boolean);

      if (open) {
        gsap.set(panelRef.current, { display: "block", pointerEvents: "auto" });
        gsap.fromTo(
          panelRef.current,
          { autoAlpha: 0, y: -10, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" }
        );
        gsap.fromTo(
          itemEls,
          { autoAlpha: 0, y: -8 },
          { autoAlpha: 1, y: 0, duration: 0.28, stagger: 0.045, delay: 0.04, ease: "power2.out" }
        );
      } else {
        gsap.to(panelRef.current, {
          autoAlpha: 0,
          y: -10,
          scale: 0.97,
          duration: 0.2,
          ease: "power2.in",
          pointerEvents: "none",
          onComplete: () => {
            if (panelRef.current) gsap.set(panelRef.current, { display: "none" });
          },
        });
      }

      gsap.to(arrowRef.current, {
        rotate: open ? 180 : 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }, rootRef);

    return () => ctx.revert();
  }, [open]);

  const focusItem = (idx) => {
    itemRefs.current[idx]?.focus();
  };

  const handleTriggerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(0));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleItemKeyDown = (e, idx) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(Math.min(idx + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx === 0) {
        rootRef.current?.querySelector(".vm-dropdown-trigger")?.focus();
      } else {
        focusItem(idx - 1);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector(".vm-dropdown-trigger")?.focus();
    }
  };

  const handleItemClick = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className={`vm-dropdown ${open ? "is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="vm-nav-link vm-dropdown-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
      >
        {title}
        <HiChevronDown className="vm-dropdown-arrow" ref={arrowRef} />
      </button>

      <div className="vm-dropdown-panel" ref={panelRef} role="menu">
        <div className="vm-dropdown-panel-inner">
          {items.map((item, idx) => (
            <NavLink
              key={item.id}
              to={item.path}
              role="menuitem"
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onKeyDown={(e) => handleItemKeyDown(e, idx)}
              onClick={handleItemClick}
              className={({ isActive }) => `vm-dropdown-item ${isActive ? "active" : ""}`}
            >
              <span className="vm-dropdown-item-title">{item.title}</span>
              {item.description && (
                <span className="vm-dropdown-item-desc">{item.description}</span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NavDropdown;
