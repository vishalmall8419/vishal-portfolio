import { useEffect, useState } from "react";
import { FiSave, FiLock, FiUser, FiLink, FiImage, FiGlobe, FiBarChart2, FiFileText, FiTool, FiMessageCircle } from "react-icons/fi";
import ImageUpload from "../../components/ImageUpload";
import { settingsApi, authApi } from "../../api";
import { FILE_BASE_URL } from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import { useToast, errMsg } from "../../context/ToastContext";
import useTheme from "../../../hooks/useTheme";
import "./Settings.css";

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in the browser's local time,
// not the ISO string Sequelize/JSON returns.
const toDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TABS = [
  { key: "profile", label: "Profile", icon: <FiUser /> },
  { key: "password", label: "Password", icon: <FiLock /> },
  { key: "site", label: "Site Info", icon: <FiGlobe /> },
  { key: "about", label: "About Content", icon: <FiFileText /> },
  { key: "stats", label: "Statistics", icon: <FiBarChart2 /> },
  { key: "social", label: "Social Links", icon: <FiLink /> },
  { key: "assets", label: "Logo / Favicon / Resume / Photo", icon: <FiImage /> },
  { key: "maintenance", label: "Maintenance", icon: <FiTool /> },
  { key: "ai", label: "AI Settings", icon: <FiMessageCircle /> },
];

export default function Settings() {
  const { admin, setAdmin } = useAuth();
  const toast = useToast();
  const { refreshSiteData } = useTheme();
  const [tab, setTab] = useState("profile");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", avatar: null });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);

  const [siteForm, setSiteForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    address: "",
    experience: "",
    languages: "",
    careerObjective: "",
    currentFocus: "",
  });
  const [savingSite, setSavingSite] = useState(false);

  const [statsForm, setStatsForm] = useState({
    totalProjects: 0,
    technologies: 0,
    certifications: 0,
    achievements: 0,
    experience: 0,
    happyClients: 0,
    ongoingProjects: 0,
    openSourceProjects: 0,
    yearsExperience: 0,
  });
  const [savingStats, setSavingStats] = useState(false);

  const [aboutForm, setAboutForm] = useState({ myStory: "", futureVision: "", missionGoal: "" });
  const [savingAbout, setSavingAbout] = useState(false);

  const [socialForm, setSocialForm] = useState({});
  const [githubUsername, setGithubUsername] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceMode: false,
    maintenanceMessage: "",
    maintenanceEndsAt: "",
    maintenanceSplineUrl: "",
  });
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  const [aiForm, setAiForm] = useState({
    aiEnabled: true,
    aiName: "",
    aiAvatar: "",
    aiStatus: "",
    aiWelcomeTitle: "",
    aiWelcomeMessage: "",
    aiPlaceholder: "",
    aiEmptyChatMessage: "",
    aiTypingIndicatorText: "",
    aiThemeColor: "",
    aiAccentColor: "",
    aiBubbleStyle: "rounded",
    aiTypingSpeed: "natural",
    aiResponseDelay: 600,
    aiTypingAnimationEnabled: true,
    aiSuggestedQuestions: [],
    aiSearchPriority: [],
  });
  const [newQuestion, setNewQuestion] = useState("");
  const [savingAi, setSavingAi] = useState(false);
  const [uploadingAiAvatar, setUploadingAiAvatar] = useState(false);

  const [savingAsset, setSavingAsset] = useState(null);

  useEffect(() => {
    if (admin) {
      setProfileForm({ name: admin.name || "", email: admin.email || "", phone: admin.phone || "", avatar: admin.avatar || null });
    }
  }, [admin]);

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      setSettings(data.data);
      setSocialForm(data.data.socialLinks || {});
      setGithubUsername(data.data.githubUsername || "");
      setSiteForm({
        name: data.data.name || "",
        role: data.data.role || "",
        phone: data.data.phone || "",
        email: data.data.email || "",
        address: data.data.address || "",
        experience: data.data.experience || "",
        languages: data.data.languages || "",
        careerObjective: data.data.careerObjective || "",
        currentFocus: Array.isArray(data.data.currentFocus) ? data.data.currentFocus.join(", ") : "",
      });
      setStatsForm((prev) => ({ ...prev, ...(data.data.stats || {}) }));
      setAboutForm({
        myStory: data.data.aboutContent?.myStory || "",
        futureVision: data.data.aboutContent?.futureVision || "",
        missionGoal: data.data.aboutContent?.missionGoal || "",
      });
      setMaintenanceForm({
        maintenanceMode: !!data.data.maintenanceMode,
        maintenanceMessage: data.data.maintenanceMessage || "",
        maintenanceEndsAt: toDatetimeLocal(data.data.maintenanceEndsAt),
        maintenanceSplineUrl: data.data.maintenanceSplineUrl || "",
      });
      setAiForm({
        aiEnabled: data.data.aiEnabled !== false,
        aiName: data.data.aiName || "",
        aiAvatar: data.data.aiAvatar || "",
        aiStatus: data.data.aiStatus || "",
        aiWelcomeTitle: data.data.aiWelcomeTitle || "",
        aiWelcomeMessage: data.data.aiWelcomeMessage || "",
        aiPlaceholder: data.data.aiPlaceholder || "",
        aiEmptyChatMessage: data.data.aiEmptyChatMessage || "",
        aiTypingIndicatorText: data.data.aiTypingIndicatorText || "",
        aiThemeColor: data.data.aiThemeColor || "",
        aiAccentColor: data.data.aiAccentColor || "",
        aiBubbleStyle: data.data.aiBubbleStyle || "rounded",
        aiTypingSpeed: data.data.aiTypingSpeed || "natural",
        aiResponseDelay: data.data.aiResponseDelay ?? 600,
        aiTypingAnimationEnabled: data.data.aiTypingAnimationEnabled !== false,
        aiSuggestedQuestions: data.data.aiSuggestedQuestions || [],
        aiSearchPriority: data.data.aiSearchPriority || [],
      });
    }).catch((err) => toast.error(errMsg(err, "Failed to load settings.")))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const fd = new FormData();
      fd.append("name", profileForm.name);
      fd.append("email", profileForm.email);
      fd.append("phone", profileForm.phone);
      if (profileForm.avatar instanceof File) fd.append("avatar", profileForm.avatar);
      const { data } = await settingsApi.updateProfile(fd);
      setAdmin((a) => ({ ...a, ...data.data }));
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(errMsg(err, "Failed to update profile."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(errMsg(err, "Failed to change password."));
    } finally {
      setSavingPw(false);
    }
  };

  const handleSocialSave = async (e) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      const { data } = await settingsApi.update({ socialLinks: socialForm, githubUsername });
      setSettings(data.data);
      toast.success("Social links updated.");
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update social links."));
    } finally {
      setSavingSocial(false);
    }
  };

  const handleSiteSave = async (e) => {
    e.preventDefault();
    setSavingSite(true);
    try {
      const payload = {
        ...siteForm,
        currentFocus: siteForm.currentFocus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const { data } = await settingsApi.update(payload);
      setSettings(data.data);
      toast.success("Site info updated.");
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update site info."));
    } finally {
      setSavingSite(false);
    }
  };

  const handleStatsSave = async (e) => {
    e.preventDefault();
    setSavingStats(true);
    try {
      const numericStats = Object.fromEntries(
        Object.entries(statsForm).map(([k, v]) => [k, Number(v) || 0])
      );
      const { data } = await settingsApi.update({ stats: numericStats });
      setSettings(data.data);
      toast.success("Statistics updated.");
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update statistics."));
    } finally {
      setSavingStats(false);
    }
  };

  const handleAboutSave = async (e) => {
    e.preventDefault();
    setSavingAbout(true);
    try {
      const { data } = await settingsApi.update({ aboutContent: aboutForm });
      setSettings(data.data);
      toast.success("About page content updated.");
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update About content."));
    } finally {
      setSavingAbout(false);
    }
  };

  const handleMaintenanceSave = async (e) => {
    e.preventDefault();
    setSavingMaintenance(true);
    try {
      const payload = {
        maintenanceMode: maintenanceForm.maintenanceMode,
        maintenanceMessage: maintenanceForm.maintenanceMessage,
        maintenanceEndsAt: maintenanceForm.maintenanceEndsAt
          ? new Date(maintenanceForm.maintenanceEndsAt).toISOString()
          : null,
        maintenanceSplineUrl: maintenanceForm.maintenanceSplineUrl || null,
      };
      const { data } = await settingsApi.update(payload);
      setSettings(data.data);
      toast.success(
        maintenanceForm.maintenanceMode
          ? "Maintenance mode is now ON — the public site is showing the maintenance page."
          : "Maintenance mode is now OFF — the public site is live."
      );
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update maintenance settings."));
    } finally {
      setSavingMaintenance(false);
    }
  };

  const handleAiSave = async (e) => {
    e.preventDefault();
    setSavingAi(true);
    try {
      const { data } = await settingsApi.update({
        aiEnabled: aiForm.aiEnabled,
        aiName: aiForm.aiName,
        aiStatus: aiForm.aiStatus,
        aiWelcomeTitle: aiForm.aiWelcomeTitle,
        aiWelcomeMessage: aiForm.aiWelcomeMessage,
        aiPlaceholder: aiForm.aiPlaceholder,
        aiEmptyChatMessage: aiForm.aiEmptyChatMessage,
        aiTypingIndicatorText: aiForm.aiTypingIndicatorText,
        aiThemeColor: aiForm.aiThemeColor,
        aiAccentColor: aiForm.aiAccentColor,
        aiBubbleStyle: aiForm.aiBubbleStyle,
        aiTypingSpeed: aiForm.aiTypingSpeed,
        aiResponseDelay: aiForm.aiResponseDelay,
        aiTypingAnimationEnabled: aiForm.aiTypingAnimationEnabled,
        aiSuggestedQuestions: aiForm.aiSuggestedQuestions,
        aiSearchPriority: aiForm.aiSearchPriority,
      });
      setSettings(data.data);
      toast.success("AI Settings saved.");
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to save AI Settings."));
    } finally {
      setSavingAi(false);
    }
  };

  const addSuggestedQuestion = () => {
    const q = newQuestion.trim();
    if (!q) return;
    setAiForm((f) => ({ ...f, aiSuggestedQuestions: [...f.aiSuggestedQuestions, q] }));
    setNewQuestion("");
  };

  const removeSuggestedQuestion = (index) => {
    setAiForm((f) => ({
      ...f,
      aiSuggestedQuestions: f.aiSuggestedQuestions.filter((_, i) => i !== index),
    }));
  };

  const movePriority = (index, dir) => {
    setAiForm((f) => {
      const arr = [...f.aiSearchPriority];
      const swapWith = index + dir;
      if (swapWith < 0 || swapWith >= arr.length) return f;
      [arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
      return { ...f, aiSearchPriority: arr };
    });
  };

  const handleAiAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAiAvatar(true);
    try {
      const fd = new FormData();
      fd.append("aiAvatar", file);
      const { data } = await settingsApi.uploadAsset("aiAvatar", fd);
      setSettings(data.data);
      setAiForm((f) => ({ ...f, aiAvatar: data.data.aiAvatar }));
      toast.success("AI avatar updated.");
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, "Failed to upload AI avatar."));
    } finally {
      setUploadingAiAvatar(false);
    }
  };

  const handleAssetUpload = async (field, file) => {
    if (!file) return;
    setSavingAsset(field);
    try {
      const fd = new FormData();
      fd.append(field, file);
      const { data } = await settingsApi.uploadAsset(field, fd);
      setSettings(data.data);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated.`);
      refreshSiteData();
    } catch (err) {
      toast.error(errMsg(err, `Failed to upload ${field}.`));
    } finally {
      setSavingAsset(null);
    }
  };

  const socialKeys = ["github", "linkedin", "twitter", "instagram", "youtube", "facebook", "website"];

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Settings</h1>
          <p className="admx-page-subtitle">Manage your admin profile, security, and site assets.</p>
        </div>
      </div>

      <div className="admx-settings-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`admx-settings-tab ${tab === t.key ? "is-active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admx-loading-block"><div className="admx-spinner" /> Loading…</div>
      ) : (
        <div className="admx-glass admx-settings-card">
          {tab === "profile" && (
            <form className="admx-form-grid" onSubmit={handleProfileSave}>
              <div className="admx-field admx-span-2">
                <ImageUpload
                  label="Avatar"
                  value={profileForm.avatar}
                  onChange={(file) => setProfileForm((f) => ({ ...f, avatar: file }))}
                />
              </div>
              <div className="admx-field">
                <label className="admx-label">Name</label>
                <input className="admx-input" value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Email</label>
                <input className="admx-input" type="email" value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Phone</label>
                <input className="admx-input" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingProfile}>
                  {savingProfile ? <span className="admx-spinner" /> : <><FiSave /> Save Profile</>}
                </button>
              </div>
            </form>
          )}

          {tab === "password" && (
            <form className="admx-form-grid" onSubmit={handlePasswordSave} style={{ maxWidth: 460 }}>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Current password</label>
                <input className="admx-input" type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">New password</label>
                <input className="admx-input" type="password" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} />
                <div className="admx-hint">Minimum 8 characters.</div>
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Confirm new password</label>
                <input className="admx-input" type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
              </div>
              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingPw}>
                  {savingPw ? <span className="admx-spinner" /> : <><FiLock /> Change Password</>}
                </button>
              </div>
            </form>
          )}

          {tab === "social" && (
            <form className="admx-form-grid" onSubmit={handleSocialSave}>
              <div className="admx-field admx-span-2">
                <label className="admx-label">GitHub username (for the Open Source page)</label>
                <input
                  className="admx-input"
                  placeholder="e.g. octocat"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value.trim())}
                />
                <div className="admx-hint">
                  Powers the <code>/open-source</code> page — profile, repos, stars, and
                  language breakdown are pulled live from the GitHub API for this username.
                </div>
              </div>
              {socialKeys.map((key) => (
                <div className="admx-field" key={key}>
                  <label className="admx-label" style={{ textTransform: "capitalize" }}>{key}</label>
                  <input
                    className="admx-input"
                    placeholder={`https://${key}.com/yourname`}
                    value={socialForm[key] || ""}
                    onChange={(e) => setSocialForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingSocial}>
                  {savingSocial ? <span className="admx-spinner" /> : <><FiSave /> Save Social Links</>}
                </button>
              </div>
            </form>
          )}

          {tab === "site" && (
            <form className="admx-form-grid" onSubmit={handleSiteSave}>
              <div className="admx-field">
                <label className="admx-label">Public site name</label>
                <input className="admx-input" value={siteForm.name} onChange={(e) => setSiteForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Role / Tagline</label>
                <input className="admx-input" value={siteForm.role} onChange={(e) => setSiteForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Public email</label>
                <input className="admx-input" type="email" value={siteForm.email} onChange={(e) => setSiteForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Public phone</label>
                <input className="admx-input" value={siteForm.phone} onChange={(e) => setSiteForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Address</label>
                <input className="admx-input" value={siteForm.address} onChange={(e) => setSiteForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Experience</label>
                <input className="admx-input" placeholder="e.g. 3+ Years" value={siteForm.experience} onChange={(e) => setSiteForm((f) => ({ ...f, experience: e.target.value }))} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Languages</label>
                <input className="admx-input" placeholder="e.g. English, Hindi" value={siteForm.languages} onChange={(e) => setSiteForm((f) => ({ ...f, languages: e.target.value }))} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Career objective</label>
                <textarea className="admx-input" rows={3} value={siteForm.careerObjective} onChange={(e) => setSiteForm((f) => ({ ...f, careerObjective: e.target.value }))} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Current focus (comma-separated)</label>
                <input className="admx-input" placeholder="e.g. React, Node.js, System Design" value={siteForm.currentFocus} onChange={(e) => setSiteForm((f) => ({ ...f, currentFocus: e.target.value }))} />
              </div>
              <div className="admx-hint admx-span-2">
                This is the info shown across the public portfolio (Home, About, Profile, Contact, Footer). It's separate from your admin login credentials in the Profile tab.
              </div>
              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingSite}>
                  {savingSite ? <span className="admx-spinner" /> : <><FiSave /> Save Site Info</>}
                </button>
              </div>
            </form>
          )}

          {tab === "about" && (
            <form className="admx-form-grid" onSubmit={handleAboutSave}>
              <div className="admx-field admx-span-2">
                <label className="admx-label">My Story (About page)</label>
                <textarea
                  className="admx-input"
                  rows={6}
                  placeholder="Leave blank to keep the default story text."
                  value={aboutForm.myStory}
                  onChange={(e) => setAboutForm((f) => ({ ...f, myStory: e.target.value }))}
                />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Future Vision (About page)</label>
                <textarea
                  className="admx-input"
                  rows={5}
                  placeholder="Leave blank to keep the default vision text."
                  value={aboutForm.futureVision}
                  onChange={(e) => setAboutForm((f) => ({ ...f, futureVision: e.target.value }))}
                />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Mission / Biggest Goal (About page)</label>
                <textarea
                  className="admx-input"
                  rows={4}
                  placeholder="Leave blank to hide this paragraph."
                  value={aboutForm.missionGoal}
                  onChange={(e) => setAboutForm((f) => ({ ...f, missionGoal: e.target.value }))}
                />
              </div>
              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingAbout}>
                  {savingAbout ? <span className="admx-spinner" /> : <><FiSave /> Save About Content</>}
                </button>
              </div>
            </form>
          )}

          {tab === "stats" && (
            <form className="admx-form-grid" onSubmit={handleStatsSave}>
              {Object.keys(statsForm).map((key) => (
                <div className="admx-field" key={key}>
                  <label className="admx-label" style={{ textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    className="admx-input"
                    type="number"
                    value={statsForm[key]}
                    onChange={(e) => setStatsForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="admx-hint admx-span-2">
                These numbers power the counters on Home and the Project Statistics section.
              </div>
              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingStats}>
                  {savingStats ? <span className="admx-spinner" /> : <><FiSave /> Save Statistics</>}
                </button>
              </div>
            </form>
          )}

          {tab === "assets" && (
            <div className="admx-form-grid">
              <div className="admx-field">
                <ImageUpload
                  label="Profile photo (public site)"
                  value={settings?.avatar}
                  onChange={(file) => handleAssetUpload("avatar", file)}
                  hint={savingAsset === "avatar" ? "Uploading…" : "Shown on Home, About, Profile, Contact, Hire Me and every card."}
                />
              </div>
              <div className="admx-field">
                <ImageUpload
                  label="Site logo"
                  value={settings?.logo}
                  onChange={(file) => handleAssetUpload("logo", file)}
                  hint={savingAsset === "logo" ? "Uploading…" : "Shown in the portfolio navbar/footer."}
                />
              </div>
              <div className="admx-field">
                <ImageUpload
                  label="Favicon"
                  value={settings?.favicon}
                  onChange={(file) => handleAssetUpload("favicon", file)}
                  hint={savingAsset === "favicon" ? "Uploading…" : "Square image, ideally 512×512."}
                />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Resume (PDF)</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="admx-input"
                  onChange={(e) => handleAssetUpload("resume", e.target.files?.[0])}
                />
                {settings?.resume && (
                  <div className="admx-hint">
                    Current file:{" "}
                    <a
                      href={/^https?:\/\//i.test(settings.resume) ? settings.resume : `${FILE_BASE_URL}${settings.resume}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      view resume
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "maintenance" && (
            <form className="admx-form-grid" onSubmit={handleMaintenanceSave}>
              <div className="admx-span-2">
                <label className="admx-checkbox-row">
                  <input
                    type="checkbox"
                    checked={maintenanceForm.maintenanceMode}
                    onChange={(e) =>
                      setMaintenanceForm((f) => ({ ...f, maintenanceMode: e.target.checked }))
                    }
                  />
                  Put the public portfolio into Maintenance Mode
                </label>
                <div className="admx-hint" style={{ marginTop: 6 }}>
                  While ON, visitors see a maintenance page instead of the site. The admin
                  panel (this page) stays reachable so you can turn it back off.
                </div>
              </div>

              <div className="admx-field admx-span-2">
                <label className="admx-label">Message shown to visitors</label>
                <textarea
                  className="admx-input"
                  rows={3}
                  value={maintenanceForm.maintenanceMessage}
                  onChange={(e) =>
                    setMaintenanceForm((f) => ({ ...f, maintenanceMessage: e.target.value }))
                  }
                  placeholder="We're currently performing scheduled maintenance. We'll be back online shortly."
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">Expected back online (optional)</label>
                <input
                  type="datetime-local"
                  className="admx-input"
                  value={maintenanceForm.maintenanceEndsAt}
                  onChange={(e) =>
                    setMaintenanceForm((f) => ({ ...f, maintenanceEndsAt: e.target.value }))
                  }
                />
                <div className="admx-hint">Powers a live countdown on the maintenance page. Leave blank to hide it.</div>
              </div>

              <div className="admx-field">
                <label className="admx-label">Spline 3D scene URL (optional)</label>
                <input
                  className="admx-input"
                  value={maintenanceForm.maintenanceSplineUrl}
                  onChange={(e) =>
                    setMaintenanceForm((f) => ({ ...f, maintenanceSplineUrl: e.target.value }))
                  }
                  placeholder="https://my.spline.design/your-scene/"
                />
                <div className="admx-hint">
                  Paste a public Spline "Embed" link. Leave blank to use the animated gradient
                  background instead.
                </div>
              </div>

              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingMaintenance}>
                  {savingMaintenance ? <span className="admx-spinner" /> : <><FiSave /> Save Maintenance Settings</>}
                </button>
              </div>
            </form>
          )}

          {tab === "ai" && (
            <form className="admx-form-grid" onSubmit={handleAiSave}>
              <div className="admx-span-2">
                <label className="admx-checkbox-row">
                  <input
                    type="checkbox"
                    checked={aiForm.aiEnabled}
                    onChange={(e) => setAiForm((f) => ({ ...f, aiEnabled: e.target.checked }))}
                  />
                  Enable VP-ChatBot on the public portfolio
                </label>
                <div className="admx-hint" style={{ marginTop: 6 }}>
                  VP-ChatBot only answers from your portfolio's own content (About, Skills,
                  Projects, Experience, etc.) — it never guesses or makes anything up. If it
                  can't find something in your data, it says so.
                </div>
              </div>

              <div className="admx-span-2 admx-form-subhead">General</div>

              <div className="admx-field">
                <label className="admx-label">AI name</label>
                <input
                  className="admx-input"
                  value={aiForm.aiName}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiName: e.target.value }))}
                  placeholder="VP-ChatBot"
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">AI status</label>
                <input
                  className="admx-input"
                  value={aiForm.aiStatus}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiStatus: e.target.value }))}
                  placeholder="Online"
                />
              </div>

              <div className="admx-field">
                <ImageUpload
                  label="AI avatar"
                  value={aiForm.aiAvatar}
                  onChange={handleAiAvatarUpload}
                  hint={uploadingAiAvatar ? "Uploading…" : "Shown in the chat header. Optional."}
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">Placeholder text</label>
                <input
                  className="admx-input"
                  value={aiForm.aiPlaceholder}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiPlaceholder: e.target.value }))}
                  placeholder="Ask me anything about my portfolio..."
                />
              </div>

              <div className="admx-field admx-span-2">
                <label className="admx-label">Welcome title</label>
                <input
                  className="admx-input"
                  value={aiForm.aiWelcomeTitle}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiWelcomeTitle: e.target.value }))}
                  placeholder="Welcome to VP-ChatBot ✨"
                />
              </div>

              <div className="admx-field admx-span-2">
                <label className="admx-label">Welcome message</label>
                <textarea
                  className="admx-input"
                  rows={2}
                  value={aiForm.aiWelcomeMessage}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiWelcomeMessage: e.target.value }))}
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">Empty chat message</label>
                <input
                  className="admx-input"
                  value={aiForm.aiEmptyChatMessage}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiEmptyChatMessage: e.target.value }))}
                  placeholder="Start a conversation with VP-ChatBot to explore my portfolio."
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">Typing indicator text</label>
                <input
                  className="admx-input"
                  value={aiForm.aiTypingIndicatorText}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiTypingIndicatorText: e.target.value }))}
                  placeholder="VP-ChatBot is thinking..."
                />
              </div>

              <div className="admx-span-2 admx-form-subhead">Appearance</div>

              <div className="admx-field">
                <label className="admx-label">Theme color</label>
                <input
                  type="color"
                  className="admx-input admx-color-input"
                  value={aiForm.aiThemeColor || "#7c5cff"}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiThemeColor: e.target.value }))}
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">Accent color</label>
                <input
                  type="color"
                  className="admx-input admx-color-input"
                  value={aiForm.aiAccentColor || "#00e5ff"}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiAccentColor: e.target.value }))}
                />
              </div>

              <div className="admx-field">
                <label className="admx-label">Chat bubble style</label>
                <select
                  className="admx-select"
                  value={aiForm.aiBubbleStyle}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiBubbleStyle: e.target.value }))}
                >
                  <option value="rounded">Rounded</option>
                  <option value="sharp">Sharp</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className="admx-span-2 admx-form-subhead">Behaviour</div>

              <div className="admx-field">
                <label className="admx-label">Typing speed</label>
                <select
                  className="admx-select"
                  value={aiForm.aiTypingSpeed}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiTypingSpeed: e.target.value }))}
                >
                  <option value="slow">Slow</option>
                  <option value="natural">Natural</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div className="admx-field">
                <label className="admx-label">Response delay (ms)</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="100"
                  className="admx-input"
                  value={aiForm.aiResponseDelay}
                  onChange={(e) => setAiForm((f) => ({ ...f, aiResponseDelay: Number(e.target.value) || 0 }))}
                />
                <div className="admx-hint">Minimum "thinking" pause before the reply appears.</div>
              </div>

              <div className="admx-field">
                <label className="admx-checkbox-row">
                  <input
                    type="checkbox"
                    checked={aiForm.aiTypingAnimationEnabled}
                    onChange={(e) => setAiForm((f) => ({ ...f, aiTypingAnimationEnabled: e.target.checked }))}
                  />
                  Typewriter animation enabled
                </label>
              </div>

              <div className="admx-field admx-span-2">
                <label className="admx-label">Suggested questions</label>
                <div className="admx-tag-input-row">
                  <input
                    className="admx-input"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSuggestedQuestion();
                      }
                    }}
                    placeholder="e.g. What are your skills?"
                  />
                  <button type="button" className="admx-btn admx-btn-outline" onClick={addSuggestedQuestion}>
                    Add
                  </button>
                </div>
                <div className="admx-chip-list">
                  {aiForm.aiSuggestedQuestions.map((q, i) => (
                    <span className="admx-chip" key={`${q}-${i}`}>
                      {q}
                      <button type="button" onClick={() => removeSuggestedQuestion(i)} aria-label="Remove">
                        ×
                      </button>
                    </span>
                  ))}
                  {aiForm.aiSuggestedQuestions.length === 0 && (
                    <span className="admx-hint">No suggested questions yet.</span>
                  )}
                </div>
              </div>

              <div className="admx-field admx-span-2">
                <label className="admx-label">Search priority</label>
                <div className="admx-hint" style={{ marginBottom: 8 }}>
                  When a question could match more than one content type, higher items win ties.
                </div>
                <ol className="admx-priority-list">
                  {aiForm.aiSearchPriority.map((type, i) => (
                    <li key={type}>
                      <span>{i + 1}. {type}</span>
                      <span className="admx-priority-controls">
                        <button type="button" onClick={() => movePriority(i, -1)} disabled={i === 0}>↑</button>
                        <button type="button" onClick={() => movePriority(i, 1)} disabled={i === aiForm.aiSearchPriority.length - 1}>↓</button>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={savingAi}>
                  {savingAi ? <span className="admx-spinner" /> : <><FiSave /> Save AI Settings</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}