import api from "./axiosClient";
import { createResource } from "./resource";

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  verifyOtp: (payload) => api.post("/auth/verify-otp", payload),
  resendOtp: (payload) => api.post("/auth/resend-otp", payload),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  changePassword: (payload) => api.put("/auth/change-password", payload),
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
  activity: () => api.get("/dashboard/activity"),
};

export const projectsApi = createResource("/projects");
export const blogsApi = createResource("/blogs");
export const servicesApi = createResource("/services");
export const skillsApi = createResource("/skills");
export const educationApi = createResource("/education");
export const experienceApi = createResource("/experience");
export const certificatesApi = createResource("/certificates");
export const achievementsApi = createResource("/achievements");
export const testimonialsApi = createResource("/testimonials");

export const galleryApi = {
  list: (params = {}) => api.get("/gallery", { params }),
  getOne: (id) => api.get(`/gallery/${id}`),
  categories: () => api.get("/gallery/categories"),
  create: (formData) =>
    api.post("/gallery", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/gallery/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/gallery/${id}`),
};

export const messagesApi = {
  ...createResource("/messages"),
  unreadCount: () => api.get("/messages/unread-count"),
  toggleRead: (id) => api.patch(`/messages/${id}/read`),
  toggleReplied: (id) => api.patch(`/messages/${id}/replied`),
};

export const newsletterApi = {
  list: (params = {}) => api.get("/newsletter", { params }),
  toggleStatus: (id) => api.patch(`/newsletter/${id}/status`),
  remove: (id) => api.delete(`/newsletter/${id}`),
  exportCsv: (params = {}) =>
    api.get("/newsletter/export", { params, responseType: "blob" }),
};

export const notificationsApi = {
  ...createResource("/notifications"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

export const seoApi = {
  list: () => api.get("/seo"),
  getByPage: (page) => api.get(`/seo/${page}`),
  save: (page, payload) => api.put(`/seo/${page}`, payload),
  remove: (page) => api.delete(`/seo/${page}`),
};

export const themeApi = {
  get: () => api.get("/theme"),
  update: (payload) => api.put("/theme", payload),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (payload) => api.put("/settings", payload),
  updateProfile: (formData) =>
    api.put("/settings/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadAsset: (field, formData) =>
    api.put(`/settings/upload/${field}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
