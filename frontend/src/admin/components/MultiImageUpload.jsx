import { useRef, useState } from "react";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";
import "./ImageUpload.css";

/**
 * Multi-image picker for the Gallery module's `galleryImages` field.
 *
 * existing: [{ url, publicId }, ...]  — already-uploaded Cloudinary images
 * newFiles: File[]                    — freshly picked, not yet uploaded
 * onChangeExisting(next)              — called with a filtered `existing` array (removals)
 * onChangeNewFiles(next)              — called with a filtered/appended `newFiles` array
 */
export default function MultiImageUpload({
  label,
  existing = [],
  newFiles = [],
  onChangeExisting,
  onChangeNewFiles,
  hint,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (fileList) => {
    const picked = Array.from(fileList || []);
    if (picked.length) onChangeNewFiles([...newFiles, ...picked]);
  };

  const removeExisting = (publicId) => {
    onChangeExisting(existing.filter((img) => img.publicId !== publicId));
  };

  const removeNewFile = (index) => {
    onChangeNewFiles(newFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="admx-field admx-span-2">
      {label && <label className="admx-label">{label}</label>}

      <div
        className={`admx-upload-box admx-multi-upload-dropzone ${dragOver ? "is-drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <div className="admx-upload-placeholder">
          <FiUploadCloud />
          <span>Click or drag images here (multiple allowed)</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => addFiles(e.target.files)}
      />

      {(existing.length > 0 || newFiles.length > 0) && (
        <div className="admx-multi-upload-grid">
          {existing.map((img) => (
            <div className="admx-multi-upload-thumb" key={img.publicId || img.url}>
              <img src={img.url} alt="" />
              <button type="button" onClick={() => removeExisting(img.publicId)} title="Remove">
                <FiX />
              </button>
            </div>
          ))}

          {newFiles.map((file, i) => (
            <div className="admx-multi-upload-thumb is-new" key={`new-${i}-${file.name}`}>
              <img src={URL.createObjectURL(file)} alt="" />
              <button type="button" onClick={() => removeNewFile(i)} title="Remove">
                <FiX />
              </button>
              <span className="admx-multi-upload-new-badge">New</span>
            </div>
          ))}
        </div>
      )}

      {hint && <div className="admx-hint"><FiImage /> {hint}</div>}
    </div>
  );
}
