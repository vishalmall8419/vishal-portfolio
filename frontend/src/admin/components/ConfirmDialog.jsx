import Modal from "./Modal";
import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button className="admx-btn admx-btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="admx-btn admx-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="admx-spinner" /> : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.6rem", color: "#ff7a88", flexShrink: 0 }}>
          <FiAlertTriangle />
        </span>
        <p style={{ color: "var(--text-light)", margin: 0, lineHeight: 1.6 }}>{message}</p>
      </div>
    </Modal>
  );
}
