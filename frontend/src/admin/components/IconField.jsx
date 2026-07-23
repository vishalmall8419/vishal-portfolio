import { useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";
import IconRenderer from "../../components/IconRenderer/IconRenderer";
import { classifyIconValue } from "../../utils/iconResolver";
import "./ImageUpload.css";
import "./IconField.css";

const TABS = [
  { key: "upload", label: "Upload" },
  { key: "url", label: "Image URL" },
  { key: "react-icon", label: "Icon Name" },
];

/**
 * Universal Admin Icon System.
 * One field, three ways to set it — Uploaded Image, Image URL, or a
 * react-icons component name (e.g. FaReact, SiMysql, MdJavascript) —
 * resolved in that priority order wherever it's displayed.
 *
 * value: File | string (uploaded path, URL, or icon name) | null
 * onChange(next: File | string | null)
 */
export default function IconField({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const detected = classifyIconValue(value);
  const [activeTab, setActiveTab] = useState(detected === "empty" ? "upload" : detected);

  // Re-sync the active tab when switching between rows (Create vs Edit).
  useEffect(() => {
    const next = classifyIconValue(value);
    setActiveTab(next === "empty" ? "upload" : next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (files) => {
    if (files && files[0]) onChange(files[0]);
  };

  const urlValue = activeTab === "url" && typeof value === "string" ? value : "";
  const iconNameValue = activeTab === "react-icon" && typeof value === "string" ? value : "";

  return (
    <div className="admx-field">
      {label && <label className="admx-label">{label}</label>}

      <div className="admx-icon-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admx-icon-tab ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => {
              setActiveTab(tab.key);
              onChange(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "upload" && (
        <>
          <div
            className={`admx-upload-box ${dragOver ? "is-drag" : ""} ${detected === "upload" && value ? "has-preview" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            {detected === "upload" && value ? (
              <>
                <IconRenderer value={value} alt="preview" className="admx-upload-preview" />
                <button
                  type="button"
                  className="admx-upload-remove"
                  onClick={(e) => { e.stopPropagation(); onChange(null); }}
                >
                  <FiX />
                </button>
              </>
            ) : (
              <div className="admx-upload-placeholder">
                <FiUploadCloud />
                <span>Click or drag an image here</span>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </>
      )}

      {activeTab === "url" && (
        <>
          <input
            type="text"
            className="admx-input"
            placeholder="https://example.com/logo.svg"
            value={urlValue}
            onChange={(e) => onChange(e.target.value)}
          />
          {urlValue && (
            <div className="admx-icon-preview">
              <IconRenderer value={urlValue} alt="preview" className="admx-icon-preview-img" />
            </div>
          )}
        </>
      )}

      {activeTab === "react-icon" && (
        <>
          <input
            type="text"
            className="admx-input"
            placeholder="e.g. FaReact, SiMysql, MdJavascript"
            value={iconNameValue}
            onChange={(e) => onChange(e.target.value)}
          />
          {iconNameValue && (
            <div className="admx-icon-preview">
              <IconRenderer
                value={iconNameValue}
                alt="preview"
                className="admx-icon-preview-img"
                size={28}
                fallback={<span className="admx-icon-preview-empty">Not found</span>}
              />
            </div>
          )}
        </>
      )}

      {hint && <div className="admx-hint"><FiImage /> {hint}</div>}
    </div>
  );
}
