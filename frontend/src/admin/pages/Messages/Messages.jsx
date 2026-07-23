import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiTrash2, FiMail, FiCheckCircle, FiCircle } from "react-icons/fi";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useResourceList } from "../../hooks/useResourceList";
import { messagesApi } from "../../api";
import { useToast, errMsg } from "../../context/ToastContext";
import "../CrudPage/CrudPage.css";
import "./Messages.css";

export default function Messages() {
  const [viewing, setViewing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const outletCtx = useOutletContext?.() || {};

  const { rows, loading, q, onSearch, pagination, page, setPage, reload } = useResourceList(messagesApi);

  const openMessage = async (row) => {
    try {
      const { data } = await messagesApi.getOne(row.id);
      setViewing(data.data);
      reload();
      outletCtx.refreshNotifications?.();
    } catch (err) {
      toast.error(errMsg(err, "Failed to load message."));
    }
  };

  const toggleRead = async (row, e) => {
    e.stopPropagation();
    try {
      await messagesApi.toggleRead(row.id);
      reload();
      outletCtx.refreshNotifications?.();
    } catch (err) {
      toast.error(errMsg(err, "Failed to update message."));
    }
  };

  const toggleReplied = async (row) => {
    try {
      await messagesApi.toggleReplied(row.id);
      reload();
      setViewing((v) => (v && v.id === row.id ? { ...v, isReplied: !v.isReplied } : v));
    } catch (err) {
      toast.error(errMsg(err, "Failed to update message."));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await messagesApi.remove(confirmId);
      toast.success("Message deleted.");
      setConfirmId(null);
      setViewing(null);
      reload();
      outletCtx.refreshNotifications?.();
    } catch (err) {
      toast.error(errMsg(err, "Failed to delete message."));
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "read",
      label: "",
      width: 40,
      render: (row) => (
        <button className="admx-btn-plain" onClick={(e) => toggleRead(row, e)} title={row.isRead ? "Mark unread" : "Mark read"}>
          {row.isRead ? <FiMail /> : <FiMail style={{ color: "var(--primary-light)" }} />}
        </button>
      ),
    },
    {
      key: "name",
      label: "From",
      render: (row) => (
        <div>
          <strong style={{ color: row.isRead ? "var(--text-light)" : "var(--text)" }}>{row.name}</strong>
          <span className="admx-cell-sub">{row.email}</span>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Message",
      render: (row) => (
        <span>{row.subject || row.message?.slice(0, 60)}</span>
      ),
    },
    {
      key: "isReplied",
      label: "Reply status",
      render: (row) => (
        <span className={`admx-badge ${row.isReplied ? "admx-badge-success" : "admx-badge-warning"}`}>
          {row.isReplied ? "Replied" : "Pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Received",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="admx-page">
      <div className="admx-page-head">
        <div>
          <h1 className="admx-page-title">Messages</h1>
          <p className="admx-page-subtitle">Messages submitted through your portfolio's contact form.</p>
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
        searchPlaceholder="Search messages…"
        emptyMessage="No messages yet."
        actions={(row) => (
          <>
            <button className="admx-btn admx-btn-outline admx-btn-sm" onClick={() => openMessage(row)}>
              View
            </button>
            <button className="admx-btn admx-btn-danger admx-btn-icon admx-btn-sm" onClick={() => setConfirmId(row.id)} title="Delete">
              <FiTrash2 />
            </button>
          </>
        )}
      />

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Message"
        size="md"
        footer={
          viewing && (
            <>
              <button className="admx-btn admx-btn-outline" onClick={() => toggleReplied(viewing)}>
                {viewing.isReplied ? <FiCircle /> : <FiCheckCircle />}
                {viewing.isReplied ? " Mark as pending" : " Mark as replied"}
              </button>
              <a
                className="admx-btn admx-btn-primary"
                href={`mailto:${viewing.email}?subject=${encodeURIComponent(`Re: ${viewing.subject || "Your message"}`)}`}
              >
                Reply via Email
              </a>
            </>
          )
        }
      >
        {viewing && (
          <div className="admx-message-view">
            <div className="admx-message-meta">
              <div>
                <strong>{viewing.name}</strong>
                <span>{viewing.email}</span>
              </div>
              <span className="admx-cell-sub">{new Date(viewing.createdAt).toLocaleString()}</span>
            </div>
            {viewing.subject && <h4 className="admx-message-subject">{viewing.subject}</h4>}
            <p className="admx-message-body">{viewing.message}</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message="This will permanently delete this message. This cannot be undone."
      />
    </div>
  );
}
