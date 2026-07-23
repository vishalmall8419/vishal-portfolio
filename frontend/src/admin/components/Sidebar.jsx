import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  FiGrid,
  FiFolder,
  FiEdit3,
  FiBriefcase,
  FiCode,
  FiBookOpen,
  FiClock,
  FiAward,
  FiStar,
  FiImage,
  FiMessageSquare,
  FiMail,
  FiSend,
  FiBell,
  FiSearch,
  FiDroplet,
  FiSettings,
  FiLogOut,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FiGrid /> },
  { to: "/admin/projects", label: "Projects", icon: <FiFolder /> },
  { to: "/admin/blogs", label: "Blogs", icon: <FiEdit3 /> },
  { to: "/admin/services", label: "Services", icon: <FiBriefcase /> },
  { to: "/admin/skills", label: "Skills", icon: <FiCode /> },
  { to: "/admin/education", label: "Education", icon: <FiBookOpen /> },
  { to: "/admin/experience", label: "Experience", icon: <FiClock /> },
  { to: "/admin/certificates", label: "Certificates", icon: <FiAward /> },
  { to: "/admin/achievements", label: "Achievements", icon: <FiStar /> },
  { to: "/admin/testimonials", label: "Testimonials", icon: <FiMessageSquare /> },
  { to: "/admin/gallery", label: "Gallery", icon: <FiImage /> },
  { to: "/admin/messages", label: "Messages", icon: <FiMail /> },
  { to: "/admin/newsletter", label: "Newsletter", icon: <FiSend /> },
  { to: "/admin/notifications", label: "Notifications", icon: <FiBell /> },
  { to: "/admin/seo", label: "SEO", icon: <FiSearch /> },
  { to: "/admin/theme", label: "Theme", icon: <FiDroplet /> },
  { to: "/admin/settings", label: "Settings", icon: <FiSettings /> },
];

export default function Sidebar({ collapsed, onToggle, unreadCount, unreadMessages, mobileOpen, onNavigate }) {
  const navigate = useNavigate();
  const { logout, admin } = useAuth();
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll(".admx-nav-item");
    gsap.fromTo(
      items,
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.035, ease: "power2.out" }
    );
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className={`admx-sidebar admx-glass ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
      <div className="admx-sidebar-top">
        <div className="admx-brand">
          <span className="admx-brand-mark">
            {(admin?.name || "V").charAt(0).toUpperCase()}
          </span>
          {!collapsed && <span className="admx-brand-text">Admin Panel</span>}
        </div>
        <button className="admx-collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        </button>
      </div>

      <nav className="admx-nav" ref={listRef}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `admx-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            <span className="admx-nav-icon">{item.icon}</span>
            {!collapsed && <span className="admx-nav-label">{item.label}</span>}
            {item.to === "/admin/messages" && unreadMessages > 0 && (
              <span className="admx-nav-dot">{collapsed ? "" : unreadMessages}</span>
            )}
            {item.to === "/admin/notifications" && unreadCount > 0 && (
              <span className="admx-nav-dot">{collapsed ? "" : unreadCount}</span>
            )}
            <span className="admx-nav-indicator" />
          </NavLink>
        ))}
      </nav>

      <div className="admx-sidebar-bottom">
        <button className="admx-nav-item admx-logout-btn" onClick={handleLogout}>
          <span className="admx-nav-icon"><FiLogOut /></span>
          {!collapsed && <span className="admx-nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
