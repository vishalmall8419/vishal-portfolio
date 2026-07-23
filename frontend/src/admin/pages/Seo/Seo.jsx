import { useEffect, useState } from "react";
import { FiSave, FiPlus, FiTrash2 } from "react-icons/fi";
import { seoApi } from "../../api";
import { useToast, errMsg } from "../../context/ToastContext";
import "./Seo.css";

const DEFAULT_PAGES = ["home", "about", "projects", "blogs", "contact"];

const emptyForm = (page) => ({
  page,
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  canonicalUrl: "",
  noIndex: false,
});

export default function Seo() {
  const [pages, setPages] = useState(DEFAULT_PAGES);
  const [activePage, setActivePage] = useState(DEFAULT_PAGES[0]);
  const [form, setForm] = useState(emptyForm(DEFAULT_PAGES[0]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const toast = useToast();

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data } = await seoApi.list();
      const existingKeys = data.data.map((r) => r.page);
      const merged = Array.from(new Set([...DEFAULT_PAGES, ...existingKeys]));
      setPages(merged);
      const current = data.data.find((r) => r.page === activePage);
      setForm(current ? { ...emptyForm(activePage), ...current } : emptyForm(activePage));
    } catch (err) {
      toast.error(errMsg(err, "Failed to load SEO settings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectPage = async (page) => {
    setActivePage(page);
    try {
      const { data } = await seoApi.getByPage(page);
      setForm({ ...emptyForm(page), ...data.data });
    } catch (_) {
      setForm(emptyForm(page));
    }
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await seoApi.save(activePage, form);
      toast.success(`SEO settings saved for "${activePage}".`);
    } catch (err) {
      toast.error(errMsg(err, "Failed to save SEO settings."));
    } finally {
      setSaving(false);
    }
  };

  const addPage = () => {
    const slug = newPageName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) return;
    if (!pages.includes(slug)) setPages((p) => [...p, slug]);
    setNewPageName("");
    selectPage(slug);
  };

  const removePage = async (page) => {
    if (DEFAULT_PAGES.includes(page)) return;
    try {
      await seoApi.remove(page);
      setPages((p) => p.filter((x) => x !== page));
      if (activePage === page) selectPage(DEFAULT_PAGES[0]);
      toast.success("SEO record removed.");
    } catch (err) {
      toast.error(errMsg(err, "Failed to remove SEO record."));
    }
  };

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">SEO</h1>
          <p className="admx-page-subtitle">Manage meta tags, Open Graph, and Twitter Card data per page.</p>
        </div>
      </div>

      <div className="admx-seo-layout">
        <div className="admx-glass admx-seo-pages">
          <div className="admx-seo-pages-list">
            {pages.map((p) => (
              <div
                key={p}
                className={`admx-seo-page-item ${activePage === p ? "is-active" : ""}`}
                onClick={() => selectPage(p)}
              >
                <span>{p}</span>
                {!DEFAULT_PAGES.includes(p) && (
                  <button onClick={(e) => { e.stopPropagation(); removePage(p); }} className="admx-btn-plain">
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="admx-seo-add-page">
            <input
              type="text"
              className="admx-input"
              placeholder="e.g. blog:my-post-slug"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPage()}
            />
            <button className="admx-btn admx-btn-outline admx-btn-icon" onClick={addPage}>
              <FiPlus />
            </button>
          </div>
        </div>

        <div className="admx-glass admx-seo-form-card">
          {loading ? (
            <div className="admx-loading-block"><div className="admx-spinner" /> Loading…</div>
          ) : (
            <form className="admx-form-grid" onSubmit={handleSave}>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Editing page</label>
                <input className="admx-input" value={activePage} disabled />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Meta title</label>
                <input className="admx-input" value={form.metaTitle || ""} onChange={(e) => setField("metaTitle", e.target.value)} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Meta description</label>
                <textarea className="admx-textarea" value={form.metaDescription || ""} onChange={(e) => setField("metaDescription", e.target.value)} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Keywords (comma-separated)</label>
                <input className="admx-input" value={form.keywords || ""} onChange={(e) => setField("keywords", e.target.value)} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Open Graph title</label>
                <input className="admx-input" value={form.ogTitle || ""} onChange={(e) => setField("ogTitle", e.target.value)} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Twitter card type</label>
                <select className="admx-select" value={form.twitterCard || "summary_large_image"} onChange={(e) => setField("twitterCard", e.target.value)}>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="summary">summary</option>
                </select>
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-label">Open Graph description</label>
                <textarea className="admx-textarea" value={form.ogDescription || ""} onChange={(e) => setField("ogDescription", e.target.value)} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Open Graph image URL</label>
                <input className="admx-input" value={form.ogImage || ""} onChange={(e) => setField("ogImage", e.target.value)} />
              </div>
              <div className="admx-field">
                <label className="admx-label">Canonical URL</label>
                <input className="admx-input" value={form.canonicalUrl || ""} onChange={(e) => setField("canonicalUrl", e.target.value)} />
              </div>
              <div className="admx-field admx-span-2">
                <label className="admx-checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!form.noIndex}
                    onChange={(e) => setField("noIndex", e.target.checked)}
                  />
                  Hide this page from search engines (adds noindex, nofollow)
                </label>
              </div>

              <div className="admx-span-2">
                <button type="submit" className="admx-btn admx-btn-primary" disabled={saving}>
                  {saving ? <span className="admx-spinner" /> : <><FiSave /> Save SEO Settings</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
