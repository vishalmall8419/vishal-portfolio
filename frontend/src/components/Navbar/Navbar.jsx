import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";

import NavStructure from "./NavStructure";
import NavDropdown from "./NavDropdown";
import MagneticButton from "../ui/MagneticButton";
import useTheme from "../../hooks/useTheme";
import { resolveAssetUrl } from "../../lib/publicApi";

import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { siteSettings } = useTheme();

  const siteName = siteSettings?.name || "Vishal Mall";
  const logoUrl = resolveAssetUrl(siteSettings?.logo);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleHireMeClick = () => {
    setMenuOpen(false);
    navigate("/hire-me");
  };

  return (
    <header
      className={`vm-navbar ${
        scrolled ? "vm-navbar-scrolled" : ""
      }`}
    >
      <div className="vm-navbar-container">
        <NavLink
          to="/"
          className="vm-logo"
          onClick={closeMenu}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="vm-logo-img" />
          ) : (
            <span className="vm-logo-dot"></span>
          )}

          <span className="vm-logo-text">
            {siteName}
          </span>
        </NavLink>

        <nav
          className={`vm-nav ${
            menuOpen ? "vm-nav-open" : ""
          }`}
        >
          <ul className="vm-nav-list">
            {NavStructure.map((item) =>
              item.type === "dropdown" ? (
                <li key={item.id}>
                  <NavDropdown title={item.title} items={item.items} onNavigate={closeMenu} />
                </li>
              ) : (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      isActive
                        ? "vm-nav-link active"
                        : "vm-nav-link"
                    }
                  >
                    {item.title}
                  </NavLink>
                </li>
              )
            )}
          </ul>

          <div className="vm-nav-actions">
            <MagneticButton onClick={handleHireMeClick}>
              Hire Me
            </MagneticButton>
          </div>
        </nav>

        <button
          className="vm-menu-btn"
          onClick={toggleMenu}
        >
          {menuOpen ? (
            <HiOutlineX size={30} />
          ) : (
            <HiOutlineMenuAlt3 size={30} />
          )}
        </button>
      </div>
    </header>
  );
}

export default Navbar;