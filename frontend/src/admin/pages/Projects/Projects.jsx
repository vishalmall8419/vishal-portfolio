import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiExternalLink, FiGithub } from "react-icons/fi";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormField from "../../components/FormField";
import { useResourceList } from "../../hooks/useResourceList";
import { projectsApi } from "../../api";
import { toFormData } from "../../api/resource";
import { useToast, errMsg } from "../../context/ToastContext";
import { FILE_BASE_URL } from "../../api/axiosClient";
import "../CrudPage/CrudPage.css";
import "./Projects.css";

const FIELDS = [
  { name: "title", label: "Project title", type: "text", required: true, span: 2 },
  { name: "image", label: "Cover image", type: "image", span: 2 },
  { name: "shortDescription", label: "Short description", type: "text", span: 2, placeholder: "One-liner shown on the projects grid" },
  { name: "category", label: "Category", type: "text", placeholder: "e.g. Web App" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
    ],
    default: "draft",
  },
  { name: "liveUrl", label: "Live URL", type: "text" },
  { name: "githubUrl", label: "GitHub URL", type: "text" },
  { name: "technologies", label: "Technologies (comma-separated)", type: "tags", span: 2, placeholder: "React, Node.js, MySQL" },
  { name: "order", label: "Sort order", type: "number", default: 0 },
  { name: "featured", label: "Feature this project on the homepage", type: "checkbox" },
  { name: "description", label: "Full description", type: "textarea", required: true, span: 2 },
];

const emptyForm = () => ({
  title: "", image: null, shortDescription: "", category: "", status: "draft",
  liveUrl: "", githubUrl: "", technologies: [], order: 0, featured: false, description: "",
});

export default function Projects() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { rows, loading, q, onSearch, pagination, page, setPage, reload } = useResourceList(projectsApi);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title, image: row.image, shortDescription: row.shortDescription || "",
      category: row.category || "", status: row.status, liveUrl: row.liveUrl || "",
      githubUrl: row.githubUrl || "", technologies: row.technologies || [],
      order: row.order || 0, featured: row.featured, description: row.description,
    });
    setErrors({});
    setModalOpen(true);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = "Title is required.";
    if (!form.description) errs.description = "Description is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const hasFile = form.image instanceof File;
      const payload = hasFile ? toFormData(form) : form;
      if (editing) {
        await projectsApi.update(editing.id, payload);
        toast.success("Project updated successfully.");
      } else {
        await projectsApi.create(payload);
        toast.success("Project created successfully.");
      }
      setModalOpen(false);
      reload();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        apiErrors.forEach((e) => { mapped[e.field] = e.message; });
        setErrors(mapped);
      }
      toast.error(errMsg(err, "Failed to save project."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await projectsApi.remove(confirmId);
      toast.success("Project deleted.");
      setConfirmId(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to delete project."));
    } finally {
      setDeleting(false);
    }
  };

  const toggleFeatured = async (row) => {
    try {
      await projectsApi.patch(`/${row.id}/toggle-featured`);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update featured status."));
    }
  };

  const columns = [
    {
      key: "title",
      label: "Project",
      render: (row) => (
        <div className="admx-cell-title">
          <span className="admx-cell-thumb-wrap">
            {row.image ? (
              <img src={`${FILE_BASE_URL}${row.image}`} alt="" className="admx-cell-thumb" />
            ) : (
              <span className="admx-cell-thumb admx-cell-thumb-placeholder" />
            )}
          </span>
          <span>
            {row.title}
            {row.category && <span className="admx-cell-sub">{row.category}</span>}
          </span>
        </div>
      ),
    },
    {
      key: "technologies",
      label: "Technologies",
      render: (row) => (
        <div className="admx-tech-pills">
          {(row.technologies || []).slice(0, 3).map((t) => (
            <span key={t} className="admx-tech-pill">{t}</span>
          ))}
          {(row.technologies || []).length > 3 && (
            <span className="admx-tech-pill">+{row.technologies.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`admx-badge ${row.status === "published" ? "admx-badge-success" : "admx-badge-muted"}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (row) => (
        <button
          className={`admx-star-toggle ${row.featured ? "is-active" : ""}`}
          onClick={() => toggleFeatured(row)}
          title={row.featured ? "Unfeature" : "Feature"}
        >
          <FiStar />
        </button>
      ),
    },
    {
      key: "links",
      label: "Links",
      render: (row) => (
        <div className="admx-link-icons">
          {row.liveUrl && (
            <a href={row.liveUrl} target="_blank" rel="noreferrer" className="admx-btn admx-btn-outline admx-btn-icon admx-btn-sm">
              <FiExternalLink />
            </a>
          )}
          {row.githubUrl && (
            <a href={row.githubUrl} target="_blank" rel="noreferrer" className="admx-btn admx-btn-outline admx-btn-icon admx-btn-sm">
              <FiGithub />
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Projects</h1>
          <p className="admx-page-subtitle">Manage the projects shown on your portfolio.</p>
        </div>
        <button className="admx-btn admx-btn-primary" onClick={openCreate}>
          <FiPlus /> Add Project
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        q={q}
        onSearch={onSearch}
        pagination={pagination}
        onPageChange={setPage}
        searchPlaceholder="Search projects…"
        emptyMessage="No projects yet. Add your first one."
        actions={(row) => (
          <>
            <button className="admx-btn admx-btn-outline admx-btn-icon admx-btn-sm" onClick={() => openEdit(row)} title="Edit">
              <FiEdit2 />
            </button>
            <button className="admx-btn admx-btn-danger admx-btn-icon admx-btn-sm" onClick={() => setConfirmId(row.id)} title="Delete">
              <FiTrash2 />
            </button>
          </>
        )}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Project" : "Add Project"}
        size="lg"
        footer={
          <>
            <button className="admx-btn admx-btn-outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
            <button className="admx-btn admx-btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <span className="admx-spinner" /> : editing ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <form className="admx-form-grid" onSubmit={handleSubmit}>
          {FIELDS.map((f) => (
            <FormField key={f.name} field={f} value={form[f.name]} onChange={setField} error={errors[f.name]} />
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This will permanently delete this project. This cannot be undone."
      />
    </div>
  );
}
