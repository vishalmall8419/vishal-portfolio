import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import FormField from "../../components/FormField";
import { useResourceList } from "../../hooks/useResourceList";
import { toFormData } from "../../api/resource";
import { useToast, errMsg } from "../../context/ToastContext";
import { crudConfigs } from "../../config/crudConfigs";
import { FILE_BASE_URL } from "../../api/axiosClient";
import "./CrudPage.css";

const emptyFormFrom = (fields) => {
  const obj = {};
  fields.forEach((f) => {
    obj[f.name] = f.type === "image" || f.type === "icon" ? null : f.default ?? (f.type === "tags" ? [] : "");
  });
  return obj;
};

export default function CrudPage({ moduleKey: moduleKeyProp }) {
  const params = useParams();
  const moduleKey = moduleKeyProp || params.moduleKey;
  const config = crudConfigs[moduleKey];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();
  const { rows, loading, q, onSearch, pagination, page, setPage, reload } = useResourceList(
    config?.api || { list: () => Promise.resolve({ data: { data: [], pagination: null } }) }
  );

  if (!config) return <Navigate to="/admin/dashboard" replace />;

  const openCreate = () => {
    setEditing(null);
    setForm(emptyFormFrom(config.fields));
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    const initial = {};
    config.fields.forEach((f) => {
      initial[f.name] = row[f.name] ?? (f.type === "tags" ? [] : "");
    });
    setForm(initial);
    setErrors({});
    setModalOpen(true);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const validate = () => {
    const errs = {};
    config.fields.forEach((f) => {
      if (f.required && f.type !== "image" && f.type !== "icon" && !form[f.name]) {
        errs[f.name] = `${f.label} is required.`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const hasFile = config.fields.some(
        (f) => (f.type === "image" || f.type === "icon") && form[f.name] instanceof File
      );
      const payload = hasFile ? toFormData(form) : form;

      if (editing) {
        await config.api.update(editing.id, payload);
        toast.success(`${config.title.slice(0, -1)} updated successfully.`);
      } else {
        await config.api.create(payload);
        toast.success(`${config.title.slice(0, -1)} created successfully.`);
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
      toast.error(errMsg(err, "Failed to save. Please check the form."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await config.api.remove(confirmId);
      toast.success("Deleted successfully.");
      setConfirmId(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to delete."));
    } finally {
      setDeleting(false);
    }
  };

  const renderCell = (col, row) => {
    switch (col.type) {
      case "thumb-title": {
        const imgKey = col.imgKey || "image";
        const src = row[imgKey];
        return (
          <div className="admx-cell-title">
            {config.fileField && (
              <span className="admx-cell-thumb-wrap">
                {src ? (
                  <img src={`${FILE_BASE_URL}${src}`} alt="" className="admx-cell-thumb" />
                ) : (
                  <span className="admx-cell-thumb admx-cell-thumb-placeholder" />
                )}
              </span>
            )}
            <span>
              {row[col.key]}
              {col.sub && row[col.sub] && <span className="admx-cell-sub">{row[col.sub]}</span>}
            </span>
          </div>
        );
      }
      case "status-badge": {
        const val = row[col.key];
        const tint =
          val === "published" || val === "active" ? "success" : val === "draft" || val === "inactive" ? "muted" : "primary";
        return <span className={`admx-badge admx-badge-${tint}`}>{val}</span>;
      }
      case "progress":
        return (
          <div className="admx-progress-cell">
            <div className="admx-progress-track">
              <div className="admx-progress-fill" style={{ width: `${row[col.key]}%` }} />
            </div>
            <span>{row[col.key]}%</span>
          </div>
        );
      case "stars":
        return "★".repeat(row[col.key] || 0) + "☆".repeat(5 - (row[col.key] || 0));
      case "date":
        return row[col.key] ? new Date(row[col.key]).toLocaleDateString() : "—";
      default:
        return row[col.key] ?? "—";
    }
  };

  const columns = config.columns.map((c) => ({
    ...c,
    render: (row) => renderCell(c, row),
  }));

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">{config.title}</h1>
          <p className="admx-page-subtitle">{config.subtitle}</p>
        </div>
        <button className="admx-btn admx-btn-primary" onClick={openCreate}>
          <FiPlus /> Add New
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
        searchPlaceholder={config.searchPlaceholder}
        emptyMessage={config.emptyMessage}
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
        title={editing ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`}
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
          {config.fields.map((f) => (
            <FormField
              key={f.name}
              field={f}
              value={form[f.name]}
              onChange={setField}
              error={errors[f.name]}
            />
          ))}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={`This will permanently delete this ${config.title.slice(0, -1).toLowerCase()}. This cannot be undone.`}
      />
    </div>
  );
}
