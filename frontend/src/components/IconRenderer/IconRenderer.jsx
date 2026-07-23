import { useEffect, useState } from "react";
import { resolveAssetUrl } from "../../lib/publicApi";
import { classifyIconValue, loadReactIcon } from "../../utils/iconResolver";

/**
 * Universal icon renderer. Give it whatever Admin stored for an icon/image
 * field (an uploaded file path, an absolute image URL, or a react-icons
 * component name) and it renders the right thing:
 *
 *   Uploaded Image  →  Image URL  →  React Icon  →  fallback
 *
 * value: File | string | null | undefined
 * fallback: a React node shown when nothing resolves (e.g. an <FiImage />)
 */
export default function IconRenderer({ value, alt = "", className, style, size, fallback = null }) {
  const kind = classifyIconValue(value);
  const [ReactIconComp, setReactIconComp] = useState(null);

  useEffect(() => {
    let active = true;
    if (kind === "react-icon") {
      loadReactIcon(value).then((Comp) => {
        if (active) setReactIconComp(() => Comp);
      });
    } else {
      setReactIconComp(null);
    }
    return () => {
      active = false;
    };
  }, [kind, value]);

  const mergedStyle = size ? { width: size, height: size, ...style } : style;

  if (kind === "upload") {
    const src = value instanceof File ? URL.createObjectURL(value) : resolveAssetUrl(value);
    return <img src={src} alt={alt} className={className} style={mergedStyle} loading="lazy" />;
  }

  if (kind === "url") {
    return <img src={value} alt={alt} className={className} style={mergedStyle} loading="lazy" />;
  }

  if (kind === "react-icon") {
    if (ReactIconComp) {
      const Comp = ReactIconComp;
      return <Comp className={className} style={style} size={size} aria-label={alt} />;
    }
    return fallback;
  }

  return fallback;
}
