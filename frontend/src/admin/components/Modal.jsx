import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import "./Modal.css";

export default function Modal({ open, onClose, title, children, size = "md", footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admx-modal-backdrop" onMouseDown={onClose}>
      <div
        className={`admx-modal admx-glass admx-modal-${size}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="admx-modal-head">
          <h3>{title}</h3>
          <button className="admx-icon-btn" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>
        <div className="admx-modal-body">{children}</div>
        {footer && <div className="admx-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
