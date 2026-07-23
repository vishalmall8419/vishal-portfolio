import { useState, useEffect, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { notificationsApi, messagesApi } from "../api";
import "../styles/admx-core.css";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("admx_sidebar_collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // unread notifications (bell)
  const [unreadMessages, setUnreadMessages] = useState(0); // unread messages (sidebar badge)
  const [recentNotifications, setRecentNotifications] = useState([]);

  const refreshNotifications = useCallback(async () => {
    try {
      const [{ data: countRes }, { data: listRes }, { data: msgCountRes }] = await Promise.all([
        notificationsApi.unreadCount(),
        notificationsApi.list({ limit: 5, isRead: false }),
        messagesApi.unreadCount(),
      ]);
      setUnreadCount(countRes.data.count);
      setRecentNotifications(listRes.data);
      setUnreadMessages(msgCountRes.data.count);
    } catch (_) {
      /* silent — notifications are non-critical */
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("admx_sidebar_collapsed", String(!c));
      return !c;
    });
  };

  return (
    <div className={`admx-root ${collapsed ? "is-collapsed" : ""}`}>
      <div className="admx-bg-glow" />
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        unreadCount={unreadCount}
        unreadMessages={unreadMessages}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div className="admx-mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      <div className="admx-main">
        <Topbar
          onMenuClick={() => setMobileOpen((o) => !o)}
          unreadCount={unreadCount}
          recentNotifications={recentNotifications}
          onNotificationsChanged={refreshNotifications}
        />
        <main className="admx-content">
          <Outlet context={{ refreshNotifications }} />
        </main>
      </div>
    </div>
  );
}
