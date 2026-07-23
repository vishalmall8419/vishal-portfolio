import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  FiFolder,
  FiEdit3,
  FiBriefcase,
  FiMail,
  FiEye,
  FiPlus,
  FiArrowRight,
  FiUsers,
  FiSend,
} from "react-icons/fi";
import StatCard from "../../components/StatCard";
import { dashboardApi } from "../../api";
import { errMsg, useToast } from "../../context/ToastContext";
import "./DashboardHome.css";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const gridRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([dashboardApi.stats(), dashboardApi.activity()])
      .then(([statsRes, activityRes]) => {
        if (!active) return;
        setStats(statsRes.data.data);
        setActivity(activityRes.data.data);
      })
      .catch((err) => toast.error(errMsg(err, "Failed to load dashboard.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".admx-stat-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }
    );
  }, [loading]);

  if (loading) {
    return (
      <div className="admx-page">
        <div className="admx-loading-block"><div className="admx-spinner" /> Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Welcome back 👋</h1>
          <p className="admx-page-subtitle">Here's what's happening with your portfolio.</p>
        </div>
        <div className="admx-quick-actions">
          <button className="admx-btn admx-btn-outline" onClick={() => navigate("/admin/projects")}>
            <FiPlus /> New Project
          </button>
          <button className="admx-btn admx-btn-primary" onClick={() => navigate("/admin/blogs")}>
            <FiPlus /> New Blog
          </button>
        </div>
      </div>

      <div className="admx-stat-grid" ref={gridRef}>
        <StatCard icon={<FiFolder />} label="Projects" value={stats.projects} tint="primary" />
        <StatCard icon={<FiEdit3 />} label="Blogs" value={stats.blogs} tint="cyan" />
        <StatCard icon={<FiBriefcase />} label="Services" value={stats.services} tint="violet" />
        <StatCard icon={<FiMail />} label="Messages" value={stats.messages} tint="pink" suffix={stats.unreadMessages ? ` (${stats.unreadMessages} new)` : ""} />
        <StatCard icon={<FiEye />} label="Published Projects" value={stats.publishedProjects} tint="green" />
        <StatCard icon={<FiUsers />} label="Testimonials" value={stats.testimonials} tint="amber" />
        <StatCard icon={<FiSend />} label="Newsletter Subscribers" value={stats.newsletterSubscribers} tint="cyan" />
      </div>

      <div className="admx-dashboard-columns">
        <div className="admx-glass admx-activity-card">
          <div className="admx-activity-head">
            <h3>Latest Messages</h3>
            <button className="admx-link-btn" onClick={() => navigate("/admin/messages")}>
              View all <FiArrowRight />
            </button>
          </div>
          {activity.recentMessages.length === 0 && (
            <div className="admx-empty"><FiMail /><p>No messages yet.</p></div>
          )}
          {activity.recentMessages.map((m) => (
            <div key={m.id} className="admx-activity-row" onClick={() => navigate("/admin/messages")}>
              <div className="admx-activity-avatar">{m.name?.charAt(0).toUpperCase()}</div>
              <div className="admx-activity-info">
                <strong>{m.name}</strong>
                <span>{m.subject || m.message?.slice(0, 50)}</span>
              </div>
              {!m.isRead && <span className="admx-badge admx-badge-primary">New</span>}
            </div>
          ))}
        </div>

        <div className="admx-glass admx-activity-card">
          <div className="admx-activity-head">
            <h3>Latest Blogs</h3>
            <button className="admx-link-btn" onClick={() => navigate("/admin/blogs")}>
              View all <FiArrowRight />
            </button>
          </div>
          {activity.recentBlogs.length === 0 && (
            <div className="admx-empty"><FiEdit3 /><p>No blogs yet.</p></div>
          )}
          {activity.recentBlogs.map((b) => (
            <div key={b.id} className="admx-activity-row" onClick={() => navigate("/admin/blogs")}>
              <div className="admx-activity-info">
                <strong>{b.title}</strong>
                <span>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`admx-badge ${b.status === "published" ? "admx-badge-success" : "admx-badge-muted"}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>

        <div className="admx-glass admx-activity-card">
          <div className="admx-activity-head">
            <h3>Latest Projects</h3>
            <button className="admx-link-btn" onClick={() => navigate("/admin/projects")}>
              View all <FiArrowRight />
            </button>
          </div>
          {activity.recentProjects.length === 0 && (
            <div className="admx-empty"><FiFolder /><p>No projects yet.</p></div>
          )}
          {activity.recentProjects.map((p) => (
            <div key={p.id} className="admx-activity-row" onClick={() => navigate("/admin/projects")}>
              <div className="admx-activity-info">
                <strong>{p.title}</strong>
                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
              <span className={`admx-badge ${p.status === "published" ? "admx-badge-success" : "admx-badge-muted"}`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
