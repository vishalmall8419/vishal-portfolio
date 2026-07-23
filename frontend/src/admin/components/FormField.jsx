import { useEffect, useRef, useState } from "react";
import ImageUpload from "./ImageUpload";
import IconField from "./IconField";

/**
 * Renders one input based on a field schema entry from crudConfigs.
 * value/onChange are scoped to this field only (parent manages the object).
 */
export default function FormField({ field, value, onChange, error }) {
  const commonProps = {
    id: `field-${field.name}`,
    name: field.name,
  };

  const wrapperClass = `admx-field ${field.span === 2 ? "admx-span-2" : ""}`;

  if (field.type === "image") {
    return (
      <div className={wrapperClass}>
        <ImageUpload
          label={field.label}
          value={value}
          onChange={(file) => onChange(field.name, file)}
          hint={field.hint}
        />
      </div>
    );
  }

  if (field.type === "icon") {
    return (
      <div className={wrapperClass}>
        <IconField
          label={field.label}
          value={value}
          onChange={(next) => onChange(field.name, next)}
          hint={field.hint}
        />
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className={wrapperClass}>
        <label className="admx-checkbox-row">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(field.name, e.target.checked)}
          />
          {field.label}
        </label>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <label className="admx-label" htmlFor={commonProps.id}>
        {field.label}
        {field.required && <span className="admx-req">*</span>}
      </label>

      {field.type === "textarea" && (
        <textarea
          {...commonProps}
          className="admx-textarea"
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.type === "select" && (
        <select
          {...commonProps}
          className="admx-select"
          value={value ?? field.default ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "number" && (
        <input
          {...commonProps}
          type="number"
          className="admx-input"
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value === "" ? "" : Number(e.target.value))}
        />
      )}

      {field.type === "date" && (
        <input
          {...commonProps}
          type="date"
          className="admx-input"
          value={value ? String(value).slice(0, 10) : ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.type === "tags" && (
        <TagsInput {...commonProps} value={value} placeholder={field.placeholder} onChange={onChange} fieldName={field.name} />
      )}

      {(!field.type || field.type === "text") && (
        <input
          {...commonProps}
          type="text"
          className="admx-input"
          placeholder={field.placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.hint && <div className="admx-hint">{field.hint}</div>}
      {error && <div className="admx-error">{error}</div>}
    </div>
  );
}

// A comma-separated text input backed by an array value. Kept as its own
// component with a local text buffer so commas/trailing spaces the user is
// actively typing aren't silently stripped by re-deriving the display value
// from the filtered array on every keystroke (that was the original bug --
// typing "Java, " immediately collapsed back to "Java" as you typed).
function TagsInput({ id, name, value, placeholder, onChange }) {
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join(", ") : value || ""));
  const lastEmitted = useRef(value);

  useEffect(() => {
    // Only resync from an external change (switching rows, opening
    // Create vs Edit) -- not from the array we just emitted ourselves,
    // so we never fight the user's cursor mid-keystroke.
    if (value !== lastEmitted.current) {
      setText(Array.isArray(value) ? value.join(", ") : value || "");
      lastEmitted.current = value;
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setText(raw);
    const parsed = raw.split(",").map((t) => t.trim()).filter(Boolean);
    lastEmitted.current = parsed;
    onChange(name, parsed);
  };

  return (
    <input
      id={id}
      name={name}
      type="text"
      className="admx-input"
      placeholder={placeholder || "item one, item two, item three"}
      value={text}
      onChange={handleChange}
    />
  );
}
