import { useState } from "react";
import { FiTrash2, FiDownload, FiSend, FiSlash } from "react-icons/fi";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useResourceList } from "../../hooks/useResourceList";
import { newsletterApi } from "../../api";
import { useToast, errMsg } from "../../context/ToastContext";
import "../CrudPage/CrudPage.css";
import "./Newsletter.css";

export default function Newsletter() {
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const { rows, loading, q, onSearch, pagination, page, setPage, reload } = useResourceList(
    newsletterApi,
    { status: statusFilter || undefined }
  );

  const toggleStatus = async (row) => {
    try {
      await newsletterApi.toggleStatus(row.id);
      toast.success(
        row.status === "subscribed" ? "Marked as unsubscribed." : "Marked as subscribed."
      );
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update subscriber."));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await newsletterApi.remove(confirmId);
      toast.success("Subscriber deleted.");
      setConfirmId(null);
      reload();
    } catch (err) {
      toast.error(errMsg(err, "Failed to delete subscriber."));
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await newsletterApi.exportCsv({ status: statusFilter || undefined });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "newsletter-subscribers.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(errMsg(err, "Failed to export subscribers."));
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      key: "email",
      label: "Email",
      render: (row) => <strong>{row.email}</strong>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`admx-badge ${row.status === "subscribed" ? "admx-badge-success" : "admx-badge-warning"}`}>
          {row.status === "subscribed" ? "Subscribed" : "Unsubscribed"}
        </span>
      ),
    },
    {
      key: "source",
      label: "Source",
      render: (row) => <span className="admx-cell-sub">{row.source || "—"}</span>,
    },
    {
      key: "createdAt",
      label: "Subscribed",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Newsletter</h1>
          <p className="admx-page-subtitle">Subscribers collected from your portfolio's footer signup form.</p>
        </div>
        <div className="admx-quick-actions">
          <select
            className="admx-newsletter-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="subscribed">Subscribed</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <button className="admx-btn admx-btn-outline" onClick={handleExport} disabled={exporting}>
            <FiDownload /> {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        q={q}
        onSearch={onSearch}
        pagination={pagination}
        onPageChange={setPage}
        searchPlaceholder="Search by email…"
        emptyMessage="No subscribers yet."
        actions={(row) => (
          <>
            <button
              className="admx-btn admx-btn-outline admx-btn-sm"
              onClick={() => toggleStatus(row)}
              title={row.status === "subscribed" ? "Mark unsubscribed" : "Mark subscribed"}
            >
              {row.status === "subscribed" ? <FiSlash /> : <FiSend />}
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

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This will permanently delete this subscriber. This cannot be undone."
      />
    </div>
  );
}
