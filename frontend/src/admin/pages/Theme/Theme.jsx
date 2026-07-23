import { useEffect, useState } from "react";
import { FiSave, FiSun, FiMoon } from "react-icons/fi";
import { themeApi } from "../../api";
import { useToast, errMsg } from "../../context/ToastContext";
import useTheme from "../../../hooks/useTheme";
import "./Theme.css";

const ACCENT_PRESETS = [
  { primary: "#6c63ff", secondary: "#00e5ff", label: "Violet / Cyan (default)" },
  { primary: "#7c3aed", secondary: "#f472b6", label: "Purple / Pink" },
  { primary: "#f59e0b", secondary: "#ef4444", label: "Amber / Red" },
  { primary: "#10b981", secondary: "#00e5ff", label: "Emerald / Cyan" },
];

export default function Theme() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { refreshSiteData } = useTheme();

  useEffect(() => {
    themeApi.get().then(({ data }) => setForm(data.data)).catch((err) => toast.error(errMsg(err, "Failed to load theme.")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!form) {
    return (
      <div className="admx-page">
        <div className="admx-loading-block"><div className="admx-spinner" /> Loading theme…</div>
      </div>
    );
  }

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await themeApi.update(form);
      await refreshSiteData();
      toast.success("Theme updated — the live portfolio now reflects this.");
    } catch (err) {
      toast.error(errMsg(err, "Failed to update theme."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Theme</h1>
          <p className="admx-page-subtitle">
            Controls the theme applied on your public portfolio (fetched from <code>/api/theme</code> on load).
          </p>
        </div>
        <button className="admx-btn admx-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <span className="admx-spinner" /> : <><FiSave /> Save Theme</>}
        </button>
      </div>

      <div className="admx-glass admx-theme-card">
        <h3>Mode</h3>
        <div className="admx-mode-toggle-row">
          <button
            className={`admx-mode-option ${form.mode === "dark" ? "is-active" : ""}`}
            onClick={() => setField("mode", "dark")}
          >
            <FiMoon /> Dark
          </button>
          <button
            className={`admx-mode-option ${form.mode === "light" ? "is-active" : ""}`}
            onClick={() => setField("mode", "light")}
          >
            <FiSun /> Light
          </button>
        </div>
      </div>

      <div className="admx-glass admx-theme-card">
        <h3>Accent Colors</h3>
        <div className="admx-accent-grid">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`admx-accent-option ${form.primaryColor === preset.primary ? "is-active" : ""}`}
              onClick={() => { setField("primaryColor", preset.primary); setField("secondaryColor", preset.secondary); }}
            >
              <span
                className="admx-accent-swatch"
                style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
              />
              {preset.label}
            </button>
          ))}
        </div>
        <div className="admx-form-grid" style={{ marginTop: 18 }}>
          <div className="admx-field">
            <label className="admx-label">Primary color (hex)</label>
            <input className="admx-input" value={form.primaryColor} onChange={(e) => setField("primaryColor", e.target.value)} />
          </div>
          <div className="admx-field">
            <label className="admx-label">Secondary color (hex)</label>
            <input className="admx-input" value={form.secondaryColor} onChange={(e) => setField("secondaryColor", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="admx-glass admx-theme-card">
        <h3>Animations</h3>
        <label className="admx-checkbox-row">
          <input
            type="checkbox"
            checked={form.animationsEnabled}
            onChange={(e) => setField("animationsEnabled", e.target.checked)}
          />
          Enable GSAP animations on the public portfolio
        </label>
      </div>
    </div>
  );
}
