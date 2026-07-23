import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiStar } from "react-icons/fi";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormField from "../../components/FormField";
import ImageUpload from "../../components/ImageUpload";
import MultiImageUpload from "../../components/MultiImageUpload";
import { useResourceList } from "../../hooks/useResourceList";
import { galleryApi } from "../../api";
import { useToast, errMsg } from "../../context/ToastContext";
import "../CrudPage/CrudPage.css";
import "./Gallery.css";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const TEXT_FIELDS = [
  { name: "title", label: "Title", type: "text", required: true, span: 2 },
  { name: "shortDescription", label: "Short description (shown on cards)", type: "textarea", span: 2 },
  { name: "description", label: "Full description (shown on details page)", type: "textarea", span: 2 },
  { name: "altText", label: "Alt text (accessibility + SEO)", type: "text", span: 2 },
  { name: "tags", label: "Tags / Technologies used", type: "tags", span: 2, placeholder: "React, Figma, Node.js" },
  { name: "projectLink", label: "Project link (optional)", type: "text" },
  { name: "githubLink", label: "GitHub link (optional)", type: "text" },
  { name: "displayOrder", label: "Display order", type: "number", default: 0 },
  { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS, default: "Active" },
];

const emptyForm = () => ({
  title: "",
  category: "",
  shortDescription: "",
  description: "",
  altText: "",
  tags: [],
  projectLink: "",
  githubLink: "",
  displayOrder: 0,
  status: "Active",
  featured: false,
});

export default function Gallery() {
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [coverImage, setCoverImage] = useState(null); // File | existing url string | null
  const [galleryExisting, setGalleryExisting] = useState([]); // [{url, publicId}]
  const [galleryNewFiles, setGalleryNewFiles] = useState([]); // File[]
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { rows, loading, q, onSearch, pagination, page, setPage, reload } = useResourceList(
    galleryApi,
    { category: categoryFilter === "all" ? undefined : categoryFilter }
  );

  const loadCategories = () => {
    galleryApi.categories().then(({ data }) => setCategories(data.data || [])).catch(() => {});
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setCoverImage(null);
    setGalleryExisting([]);
    setGalleryNewFiles([]);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || "",
      category: row.category || "",
      shortDescription: row.shortDescription || "",
      description: row.description || "",
      altText: row.altText || "",
      tags: Array.isArray(row.tags) ? row.tags : [],
      projectLink: row.projectLink || "",
      githubLink: row.githubLink || "",
      displayOrder: row.displayOrder ?? 0,
      status: row.status || "Active",
      featured: !!row.featured,
    });
    setCoverImage(row.image || null);
    setGalleryExisting(Array.isArray(row.galleryImages) ? row.galleryImages : []);
    setGalleryNewFiles([]);
    setErrors({});
    setModalOpen(true);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.category.trim()) errs.category = "Category is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "tags") {
        fd.append("tags", JSON.stringify(value));
      } else if (key === "featured") {
        fd.append("featured", value ? "true" : "false");
      } else {
        fd.append(key, value ?? "");
      }
    });

    if (coverImage instanceof File) fd.append("image", coverImage);

    galleryNewFiles.forEach((file) => fd.append("galleryImages", file));
    // Tells the backend which already-uploaded gallery images to keep —
    // anything on the existing row NOT in this list gets deleted from
    // Cloudinary too. Only meaningful on update; harmless on create.
    fd.append("keepGalleryImages", JSON.stringify(galleryExisting));

    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const fd = buildFormData();
      if (editing) {
        await galleryApi.update(editing.id, fd);
        toast.success("Gallery item updated successfully.");
      } else {
        await galleryApi.create(fd);
        toast.success("Gallery item created successfully.");
      }
      setModalOpen(false);
      reload();
      loadCategories();
    } catch (err) {
      toast.error(errMsg(err, "Failed to save. Please check the form."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await galleryApi.remove(confirmId);
      toast.success("Gallery item deleted.");
      setConfirmId(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to delete."));
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (row) => {
    try {
      const fd = new FormData();
      fd.append("featured", (!row.featured).toString());
      await galleryApi.update(row.id, fd);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update featured status."));
    }
  };

  const columns = [
    {
      key: "title",
      label: "Item",
      render: (row) => (
        <div className="admx-cell-title">
          <span className="admx-cell-thumb-wrap">
            {row.image ? (
              <img src={row.image} alt="" className="admx-cell-thumb" />
            ) : (
              <span className="admx-cell-thumb admx-cell-thumb-placeholder" />
            )}
          </span>
          <span>
            {row.title}
            <span className="admx-cell-sub">{row.category}</span>
          </span>
        </div>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (row) => (
        <button
          className={`admx-btn-plain ${row.featured ? "admx-featured-on" : ""}`}
          onClick={() => toggleFeatured(row)}
          title={row.featured ? "Remove from featured" : "Mark as featured"}
        >
          <FiStar fill={row.featured ? "currentColor" : "none"} />
        </button>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`admx-badge admx-badge-${row.status === "Active" ? "success" : "muted"}`}>
          {row.status}
        </span>
      ),
    },
    { key: "displayOrder", label: "Order" },
  ];

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Gallery</h1>
          <p className="admx-page-subtitle">Manage the dynamic image Gallery — powers /gallery and the Home preview.</p>
        </div>
        <button className="admx-btn admx-btn-primary" onClick={openCreate}>
          <FiPlus /> Add Gallery Item
        </button>
      </div>

      <div className="admx-gallery-filter-row">
        <select
          className="admx-select"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        q={q}
        onSearch={onSearch}
        pagination={pagination}
        onPageChange={setPage}
        searchPlaceholder="Search gallery…"
        emptyMessage="No gallery items yet."
        actions={(row) => (
          <>
            <button className="admx-btn admx-btn-outline admx-btn-icon admx-btn-sm" onClick={() => openEdit(row)} title="Edit">
              <FiEdit2 />
            </button>
            <button
              className="admx-btn admx-btn-danger admx-btn-icon admx-btn-sm"
              onClick={() => setConfirmId(row.id)}
              title="Delete"
            >
              <FiTrash2 />
            </button>
          </>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Gallery Item" : "Add Gallery Item"}
        size="lg"
        footer={
          <>
            <button className="admx-btn admx-btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="admx-btn admx-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="admx-spinner" /> : editing ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <form className="admx-form-grid" onSubmit={handleSubmit}>
          <FormField field={TEXT_FIELDS[0]} value={form.title} onChange={setField} error={errors.title} />

          <div className="admx-field">
            <label className="admx-label" htmlFor="gallery-category">
              Category<span className="admx-req">*</span>
            </label>
            <input
              id="gallery-category"
              type="text"
              className="admx-input"
              list="gallery-category-suggestions"
              placeholder="e.g. Projects, UI Designs, Dashboard…"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            />
            <datalist id="gallery-category-suggestions">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <div className="admx-hint">Type any category — new ones appear on the site automatically.</div>
            {errors.category && <div className="admx-error">{errors.category}</div>}
          </div>

          <div className="admx-field">
            <label className="admx-checkbox-row">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField("featured", e.target.checked)}
              />
              Featured (shows in the Home page preview)
            </label>
          </div>

          {TEXT_FIELDS.slice(1).map((f) => (
            <FormField key={f.name} field={f} value={form[f.name]} onChange={setField} error={errors[f.name]} />
          ))}

          <div className="admx-field admx-span-2">
            <ImageUpload
              label="Cover image"
              value={coverImage}
              onChange={setCoverImage}
              hint="Shown on gallery cards and as the main details-page image."
            />
          </div>

          <MultiImageUpload
            label="Gallery images (carousel on the details page)"
            existing={galleryExisting}
            newFiles={galleryNewFiles}
            onChangeExisting={setGalleryExisting}
            onChangeNewFiles={setGalleryNewFiles}
            hint="Uploaded to Cloudinary. Add as many as you like."
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This will permanently delete this gallery item and its Cloudinary images. This cannot be undone."
      />
    </div>
  );
}
