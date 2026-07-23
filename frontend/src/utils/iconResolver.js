/**
 * Universal Icon System — shared resolver.
 *
 * Every "icon" managed from Admin is stored as ONE string (or File, while
 * being uploaded) so no DB schema / migration is needed. This module
 * classifies that single value and — for react-icon names — dynamically
 * loads the right react-icons sub-package.
 *
 * Priority when a value is resolved for display:
 *   Uploaded Image  →  Image URL  →  React Icon  →  Fallback Icon
 * (In practice only one of these is ever stored per record, so
 * "classifying" the stored value IS the priority resolution.)
 */

// Longest prefixes first so e.g. "Fa6"/"Io5"/"Hi2" match before "Fa"/"Io"/"Hi".
const ICON_PACKS = [
  ["Fa6", "fa6"],
  ["Io5", "io5"],
  ["Hi2", "hi2"],
  ["Ai", "ai"],
  ["Bi", "bi"],
  ["Bs", "bs"],
  ["Cg", "cg"],
  ["Di", "di"],
  ["Fa", "fa"],
  ["Fc", "fc"],
  ["Fi", "fi"],
  ["Gi", "gi"],
  ["Go", "go"],
  ["Gr", "gr"],
  ["Hi", "hi"],
  ["Im", "im"],
  ["Io", "io"],
  ["Lu", "lu"],
  ["Md", "md"],
  ["Pi", "pi"],
  ["Ri", "ri"],
  ["Rx", "rx"],
  ["Si", "si"],
  ["Sl", "sl"],
  ["Tb", "tb"],
  ["Tfi", "tfi"],
  ["Ti", "ti"],
  ["Vsc", "vsc"],
  ["Wi", "wi"],
].sort((a, b) => b[0].length - a[0].length);

const dynamicImport = (pack) => {
  switch (pack) {
    case "fa": return import("react-icons/fa");
    case "fa6": return import("react-icons/fa6");
    case "ai": return import("react-icons/ai");
    case "bi": return import("react-icons/bi");
    case "bs": return import("react-icons/bs");
    case "cg": return import("react-icons/cg");
    case "di": return import("react-icons/di");
    case "fc": return import("react-icons/fc");
    case "fi": return import("react-icons/fi");
    case "gi": return import("react-icons/gi");
    case "go": return import("react-icons/go");
    case "gr": return import("react-icons/gr");
    case "hi": return import("react-icons/hi");
    case "hi2": return import("react-icons/hi2");
    case "im": return import("react-icons/im");
    case "io": return import("react-icons/io");
    case "io5": return import("react-icons/io5");
    case "lu": return import("react-icons/lu");
    case "md": return import("react-icons/md");
    case "pi": return import("react-icons/pi");
    case "ri": return import("react-icons/ri");
    case "rx": return import("react-icons/rx");
    case "si": return import("react-icons/si");
    case "sl": return import("react-icons/sl");
    case "tb": return import("react-icons/tb");
    case "tfi": return import("react-icons/tfi");
    case "ti": return import("react-icons/ti");
    case "vsc": return import("react-icons/vsc");
    case "wi": return import("react-icons/wi");
    default: return null;
  }
};

const moduleCache = {};

/** Returns the react-icons sub-package key (e.g. "fa", "si") for a component name, or null. */
export function getIconPackForName(name) {
  if (!name || typeof name !== "string") return null;
  const match = ICON_PACKS.find(([prefix]) => name.startsWith(prefix));
  return match ? match[1] : null;
}

/** Dynamically resolves a react-icons component by its exported name (e.g. "FaReact"). */
export async function loadReactIcon(name) {
  const pack = getIconPackForName(name);
  if (!pack) return null;
  const cacheKey = `${pack}:${name}`;
  if (cacheKey in moduleCache) return moduleCache[cacheKey];
  try {
    const mod = await dynamicImport(pack);
    const Comp = (mod && mod[name]) || null;
    moduleCache[cacheKey] = Comp;
    return Comp;
  } catch (_) {
    moduleCache[cacheKey] = null;
    return null;
  }
}

/**
 * Classifies a stored icon value into "upload" | "url" | "react-icon" | "empty".
 * value: File | string | null | undefined
 */
export function classifyIconValue(value) {
  if (value instanceof File) return "upload";
  if (!value || typeof value !== "string" || !value.trim()) return "empty";
  const v = value.trim();
  if (v.startsWith("/uploads/") || v.startsWith("uploads/")) return "upload";
  if (/^https?:\/\//i.test(v)) return "url";
  if (/^data:image\//i.test(v)) return "url";
  return "react-icon";
}
