import { useRef, useState } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";
import { FILE_BASE_URL } from "../api/axiosClient";
import "./ImageUpload.css";

/**
 * value: File | string (existing relative /uploads/... path) | null
 * onChange(file: File | null)
 */
export default function ImageUpload({ label, value, onChange, hint, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const previewUrl =
    value instanceof File
      ? URL.createObjectURL(value)
      : value
      ? /^https?:\/\//i.test(value)
        ? value
        : `${FILE_BASE_URL}${value}`
      : null;

  const handleFiles = (files) => {
    if (files && files[0]) onChange(files[0]);
  };

  return (
    <div className="admx-field">
      {label && <label className="admx-label">{label}</label>}
      <div
        className={`admx-upload-box ${dragOver ? "is-drag" : ""} ${previewUrl ? "has-preview" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="preview" className="admx-upload-preview" />
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
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {hint && <div className="admx-hint"><FiImage /> {hint}</div>}
    </div>
  );
}
