import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiSearch, FiSun, FiMoon, FiChevronDown, FiUser, FiLogOut, FiMenu, FiCheck } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useAdminTheme } from "../context/AdminThemeContext";
import { FILE_BASE_URL } from "../api/axiosClient";
import { notificationsApi } from "../api";
import "./Topbar.css";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  projects: "Projects",
  blogs: "Blogs",
  services: "Services",
  skills: "Skills",
  education: "Education",
  certificates: "Certificates",
  achievements: "Achievements",
  testimonials: "Testimonials",
  messages: "Messages",
  notifications: "Notifications",
  seo: "SEO",
  theme: "Theme",
  settings: "Settings",
};

export default function Topbar({ onMenuClick, unreadCount, recentNotifications = [], onNotificationsChanged }) {
  const { admin, logout } = useAuth();
  const { mode, toggleMode } = useAdminTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const segment = location.pathname.split("/")[2] || "dashboard";
  const pageTitle = PAGE_TITLES[segment] || "Dashboard";

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="admx-topbar admx-glass">
      <div className="admx-topbar-left">
        <button className="admx-icon-btn admx-mobile-menu" onClick={onMenuClick} aria-label="Menu">
          <FiMenu />
        </button>
        <div>
          <div className="admx-breadcrumb">
            <span>Admin</span> / <span className="admx-current">{pageTitle}</span>
          </div>
          <h1 className="admx-topbar-title">{pageTitle}</h1>
        </div>
      </div>

      <div className="admx-topbar-right">
        <div className="admx-search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search anything…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                navigate(`/admin/${segment}?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
              }
            }}
          />
        </div>

        <button className="admx-icon-btn" onClick={toggleMode} aria-label="Toggle theme">
          {mode === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        <div className="admx-notif-wrap" ref={notifRef}>
          <button className="admx-icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
            <FiBell />
            {unreadCount > 0 && <span className="admx-notif-badge">{unreadCount}</span>}
          </button>
          {notifOpen && (
            <div className="admx-dropdown admx-notif-dropdown admx-glass">
              <div className="admx-dropdown-head">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    className="admx-link-btn admx-notif-markall"
                    onClick={async () => {
                      await notificationsApi.markAllRead();
                      onNotificationsChanged?.();
                    }}
                  >
                    <FiCheck /> Mark all read
                  </button>
                )}
              </div>
              {recentNotifications.length === 0 && (
                <div className="admx-dropdown-empty">No new notifications.</div>
              )}
              {recentNotifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className="admx-dropdown-item"
                  onClick={async () => {
                    setNotifOpen(false);
                    await notificationsApi.markRead(n.id);
                    onNotificationsChanged?.();
                    navigate("/admin/notifications");
                  }}
                >
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </div>
              ))}
              <button className="admx-dropdown-viewall" onClick={() => { setNotifOpen(false); navigate("/admin/notifications"); }}>
                View all notifications
              </button>
            </div>
          )}
        </div>

        <div className="admx-profile-wrap" ref={profileRef}>
          <button className="admx-profile-btn" onClick={() => setProfileOpen((o) => !o)}>
            <span className="admx-avatar">
              {admin?.avatar ? (
                <img
                  src={/^https?:\/\//i.test(admin.avatar) ? admin.avatar : `${FILE_BASE_URL}${admin.avatar}`}
                  alt={admin.name}
                />
              ) : (
                (admin?.name || "A").charAt(0).toUpperCase()
              )}
            </span>
            <span className="admx-profile-name">{admin?.name || "Admin"}</span>
            <FiChevronDown className={`admx-chev ${profileOpen ? "is-open" : ""}`} />
          </button>
          {profileOpen && (
            <div className="admx-dropdown admx-profile-dropdown admx-glass">
              <div className="admx-dropdown-user">
                <strong>{admin?.name}</strong>
                <span>{admin?.email}</span>
              </div>
              <button className="admx-dropdown-action" onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}>
                <FiUser /> Profile & Settings
              </button>
              <button className="admx-dropdown-action admx-danger-action" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}