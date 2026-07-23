import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormField from "../../components/FormField";
import { useResourceList } from "../../hooks/useResourceList";
import { blogsApi } from "../../api";
import { toFormData } from "../../api/resource";
import { useToast, errMsg } from "../../context/ToastContext";
import { FILE_BASE_URL } from "../../api/axiosClient";
import "../CrudPage/CrudPage.css";

const FIELDS = [
  { name: "title", label: "Blog title", type: "text", required: true, span: 2 },
  { name: "coverImage", label: "Cover image", type: "image", span: 2 },
  { name: "excerpt", label: "Excerpt", type: "textarea", span: 2, placeholder: "Short summary shown on the blog list" },
  { name: "category", label: "Category", type: "text" },
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
  { name: "tags", label: "Tags (comma-separated)", type: "tags", span: 2 },
  { name: "content", label: "Content (HTML supported)", type: "textarea", required: true, span: 2, hint: "Read time is calculated automatically from word count." },
  { name: "metaTitle", label: "Meta title (SEO)", type: "text" },
  { name: "metaDescription", label: "Meta description (SEO)", type: "text" },
];

const emptyForm = () => ({
  title: "", coverImage: null, excerpt: "", category: "", status: "draft",
  tags: [], content: "", metaTitle: "", metaDescription: "",
});

export default function Blogs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { rows, loading, q, onSearch, pagination, page, setPage, reload } = useResourceList(blogsApi);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title, coverImage: row.coverImage, excerpt: row.excerpt || "",
      category: row.category || "", status: row.status, tags: row.tags || [],
      content: row.content, metaTitle: row.metaTitle || "", metaDescription: row.metaDescription || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = "Title is required.";
    if (!form.content) errs.content = "Content is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const hasFile = form.coverImage instanceof File;
      const payload = hasFile ? toFormData(form) : form;
      if (editing) {
        await blogsApi.update(editing.id, payload);
        toast.success("Blog updated successfully.");
      } else {
        await blogsApi.create(payload);
        toast.success("Blog created successfully.");
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
      toast.error(errMsg(err, "Failed to save blog."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await blogsApi.remove(confirmId);
      toast.success("Blog deleted.");
      setConfirmId(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to delete blog."));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "title",
      label: "Blog",
      render: (row) => (
        <div className="admx-cell-title">
          <span className="admx-cell-thumb-wrap">
            {row.coverImage ? (
              <img src={`${FILE_BASE_URL}${row.coverImage}`} alt="" className="admx-cell-thumb" />
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
    { key: "readTime", label: "Read time", render: (row) => (row.readTime ? `${row.readTime} min` : "—") },
    { key: "views", label: "Views", render: (row) => (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FiEye /> {row.views}</span>
    ) },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`admx-badge ${row.status === "published" ? "admx-badge-success" : "admx-badge-muted"}`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Blogs</h1>
          <p className="admx-page-subtitle">Write and manage your blog posts.</p>
        </div>
        <button className="admx-btn admx-btn-primary" onClick={openCreate}>
          <FiPlus /> Add Blog
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
        searchPlaceholder="Search blogs…"
        emptyMessage="No blogs yet. Write your first post."
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
        title={editing ? "Edit Blog" : "Add Blog"}
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
        message="This will permanently delete this blog post. This cannot be undone."
      />
    </div>
  );
}
