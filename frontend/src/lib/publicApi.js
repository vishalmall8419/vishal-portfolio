import axios from "axios";

/**
 * Public, unauthenticated API client for the portfolio's front-facing site.
 * Mirrors admin/api/axiosClient.js but talks to the /api/public/* routes
 * that publicRoutes.js already exposes — no new backend endpoints needed.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const FILE_BASE_URL =
  import.meta.env.VITE_FILE_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Backend stores uploaded file paths (e.g. "/uploads/projects/foo.png").
 * Turn that into an absolute URL the <img>/<a> tags can use directly.
 * Already-absolute URLs (http/https) are returned untouched.
 */
export const resolveAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${FILE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

/**
 * Normalizes admin-entered external URLs (social links, website, etc.).
 * Without this, an admin entering "linkedin.com/..." (no scheme) renders as
 * a relative <a href>, which the browser resolves against the current
 * origin -> "https://mydomain.com/linkedin.com/...". Mailto/tel links and
 * already-absolute URLs are passed through untouched.
 */
export const normalizeUrl = (url) => {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
};

export const publicApi = {
  projects: () => client.get("/public/projects"),
  projectBySlug: (slug) => client.get(`/public/projects/${slug}`),
  blogs: () => client.get("/public/blogs"),
  blogBySlug: (slug) => client.get(`/public/blogs/${slug}`),
  services: () => client.get("/public/services"),
  skills: () => client.get("/public/skills"),
  education: () => client.get("/public/education"),
  experience: () => client.get("/public/experience"),
  certificates: () => client.get("/public/certificates"),
  certificateBySlug: (slug) => client.get(`/public/certificates/${slug}`),
  achievements: () => client.get("/public/achievements"),
  achievementBySlug: (slug) => client.get(`/public/achievements/${slug}`),
  testimonials: () => client.get("/public/testimonials"),
  gallery: (params) => client.get("/public/gallery", { params }),
  galleryCategories: () => client.get("/public/gallery/categories"),
  galleryBySlug: (slug) => client.get(`/public/gallery/${slug}`),
  resume: () => client.get("/public/resume"),
  settings: () => client.get("/public/settings"),
  theme: () => client.get("/public/theme"),
  seo: (page) => client.get(`/public/seo/${page}`),
  contact: (payload) => client.post("/public/contact", payload),
  newsletterSubscribe: (email) => client.post("/public/newsletter/subscribe", { email, source: "footer" }),
  github: () => client.get("/public/github"),
  githubReadme: (repo) => client.get(`/public/github/repos/${encodeURIComponent(repo)}/readme`),
  aiConfig: () => client.get("/public/ai/config"),
  aiAsk: (question, signal) => client.post("/public/ai/ask", { question }, { signal }),
};

export default client;
